import { bindAllMethods } from '@tangram-util';

import {
    theme
} from '@tangram-core';

import {
    Drawable,
    Shape,
    Triangle,
    Square,
    Paralelogram,
    Level,
    LevelEditor,
    Levels
} from '@tangram-game';


class Tangram implements Drawable{
    store: {
        levels: Level[],
        currentLevel: Level,
        levelEditor: LevelEditor,
        shapes: Set<Shape>,

        canvas: HTMLCanvasElement | null,
        ctx: CanvasRenderingContext2D | null,

        size: {
            w: number,
            h: number
        },
        sizeSet: boolean,

        forceReactUpdate: (() => void) | null,

        flags: {
            snap: boolean,
            debugLevel: number,
            drawModes: Set<'shapes' | 'level' | 'editor-level' | 'editor-anchors'>
        },

        states: {
            tickerId: number | null,
            selected: Shape | null
        }
    }

    constructor(){
        bindAllMethods(this);

        this.store = {
            levelEditor: new LevelEditor(),
            shapes: new Set(),

            canvas: null,
            ctx: null,

            size: {
                w: 0,
                h: 0
            },
            sizeSet: false,

            forceReactUpdate: null,

            flags: {
                snap: false,
                debugLevel: 0,
                drawModes: new Set(['shapes', 'level'])
            },

            states: {
                tickerId: null,
                selected: null
            }
        } as any;
    }

    startGame() {
        const shapes = Tangram.getShapes();

        const levels = Levels.map(l=>l(this));

        this.store.levels = levels;
        this.store.currentLevel = levels[0];

        for(const shape of shapes){
            shape.init(this);
            this.shapes.add(shape);
        }
        
        shapes.map(sh => {
            sh.size.w *= 50;
            sh.size.h *= 50;
            sh.x = (Math.floor(Math.random() * 10000) % (this.size.w - 200)) + 200;
            sh.y = (Math.floor(Math.random() * 10000) % (this.size.h - 200)) + 200;
            sh.rotation = (Math.floor(Math.random() * 100) * 45) % 360;
            return sh;
        });

        this.store.levelEditor.init(this);

        this.addHandlers();
        this.startTicker();
    }


    /* getters / setters */

    set canvas(canvas: HTMLCanvasElement){
        const ctx = canvas.getContext('2d');
        if(ctx){
            this.store.canvas = canvas;
            this.store.ctx = ctx;
            this.settleSize();
        }else{
            throw new Error('Unable to get CanvasRenderingContext2D');
        }
        
    }

    get canvas(){
        if(this.store.canvas){
            return this.store.canvas;
        }
        throw new Error('canvas not bound');
    }

    set forceReactUpdate(fn: () => void) {
        this.store.forceReactUpdate = fn;
    }

    get forceReactUpdate() {
        if (this.store.forceReactUpdate) {
            return this.store.forceReactUpdate;
        }
        throw new Error('forceReactUpdate not bound');
    }


    get ctx(){
        if (this.store.ctx) {
            return this.store.ctx;
        }
        throw new Error('ctx not bound');
    }

    get size(){
        if(this.store.sizeSet){
            return this.store.size;
        }
        throw new Error('Size has not been settled');
    }

    get shapes(){
        return this.store.shapes;
    }

    get selected(){
        return this.store.states.selected;
    }

    set selected(shape: Shape | null){
        this.store.states.selected = shape;
    }

    get drawModes(){
        return this.store.flags.drawModes;
    }

    set drawModes(drawModes: Tangram["store"]["flags"]["drawModes"]){
        this.store.flags.drawModes = drawModes;
    }

    settleSize(){
        this.store.size = {
            w: this.canvas.width,
            h: this.canvas.height
        };
        this.store.sizeSet = true;
    }

    /* Tickering */

    startTicker() {
        this.store.states.tickerId = window.requestAnimationFrame(this.tick);
    }

    stopTicker() {
        if (this.store.states.tickerId !== null) {
            window.cancelAnimationFrame(this.store.states.tickerId);
            this.store.states.tickerId = null;
        }
    }

    tick(){
        this.draw();

        if(this.store.flags.debugLevel >= 1){
            this.tickDebug();
        }

        this.store.states.tickerId = window.requestAnimationFrame(this.tick);
    }

    tickDebug(){
        this.drawDebug();
    }

    /* Rendering */

    draw(){
        this.ctx.clearRect(0, 0, this.size.w, this.size.h);

        if(this.drawModes.has('level')){
            this.store.currentLevel.draw();
        }

        if(this.drawModes.has('shapes')){
            for(const shape of this.shapes){
                shape.draw();
            }
        }

        if(this.drawModes.has('editor-anchors') || this.drawModes.has('editor-level')){
            this.store.levelEditor.draw();
        }
    }

    drawDebug(){
        if(this.drawModes.has('level')){
            this.store.currentLevel.drawDebug();
        }

        if(this.drawModes.has('shapes')){
            for(const shape of this.shapes){
                shape.drawDebug();
            }
        }

        if(this.drawModes.has('editor-anchors') || this.drawModes.has('editor-level')){
            this.store.levelEditor.drawDebug();
        }

        if (this.store.flags.debugLevel >= 2) {
            const visited = new Set<Shape>();
            for (const shapeA of this.shapes) {

                const vertexA = shapeA.getCenterVertex();
                visited.add(shapeA);

                for (const shapeB of [...this.shapes].filter(s => !visited.has(s))) {
                    const vertexB = shapeB.getCenterVertex();
                    this.ctx.strokeStyle = '#00FFFF';
                    this.ctx.lineWidth = 1;

                    this.ctx.save();
                    this.ctx.beginPath();

                    this.ctx.moveTo(vertexA.x, vertexA.y);
                    this.ctx.lineTo(vertexB.x, vertexB.y);

                    this.ctx.closePath();

                    this.ctx.stroke();

                    this.ctx.restore();
                }
            }
        }

        if (this.store.flags.debugLevel >= 3) {
            const visited = new Set<Shape>();
            for (const shapeA of this.shapes) {

                const vertexAC = shapeA.getCenterVertex();
                visited.add(shapeA);

                for (const shapeB of [...this.shapes].filter(s => !visited.has(s))) {
                    const vertexBC = shapeB.getCenterVertex();

                    if (Shape.distanceVertices(vertexAC, vertexBC) < 150) {
                        const verticesA = shapeA.getVertices();
                        const verticesB = shapeB.getVertices();

                        for (const vertexA of verticesA) {
                            for (const vertexB of verticesB) {

                                this.ctx.strokeStyle = '#00FF00';
                                this.ctx.lineWidth = 1;

                                this.ctx.save();
                                this.ctx.beginPath();

                                this.ctx.moveTo(vertexA.x, vertexA.y);
                                this.ctx.lineTo(vertexB.x, vertexB.y);

                                this.ctx.closePath();

                                this.ctx.stroke();

                                this.ctx.restore();
                            }
                        }
                    }
                }
            }
        }
    }

    /* Events */

    addHandlers() {
        this.canvas.addEventListener('mousedown', this.onMouseEvent);
        this.canvas.addEventListener('mouseup', this.onMouseEvent);
        this.canvas.addEventListener('mousemove', this.onMouseEvent);
        this.canvas.addEventListener('click', this.onMouseEvent);

        document.addEventListener('keydown', this.onKeyEvent);
    }

    onMouseEvent(event: MouseEvent) {
        if(this.drawModes.has('shapes')){
            for(const shape of this.shapes){
                shape.onMouseEvent(
                    event.offsetX,
                    event.offsetY,
                    event
                );
            }
        }

        if(this.drawModes.has('editor-anchors') || this.drawModes.has('editor-level')){
            this.store.levelEditor.onMouseEvent(
                event.offsetX,
                event.offsetY,
                event
            );
        }
    }

    onKeyEvent(event: KeyboardEvent){
        if(event.type === 'keydown'){
            if(this.selected){
                event.code === 'ArrowUp' && (this.selected.y -= 1);
                event.code === 'ArrowDown' && (this.selected.y += 1);
                event.code === 'ArrowLeft' && (this.selected.x -= 1);
                event.code === 'ArrowRight' && (this.selected.x += 1);
            }
        }
    }

    /* Static */

    static getShapes(){
        return [
            new Square('sq1', 100, 100, [1, 1], 45),
            new Triangle('tr1', 100, 100, [1, 1], -45),
            new Triangle('tr1', 100, 100, [1, 1], 225),
            new Triangle('tr2', 100, 100, [2, 2], 45),
            new Triangle('tr2', 100, 100, [2, 2], 135),
            new Triangle('tr3', 100, 100, [Math.SQRT2, Math.SQRT2], 90),
            new Paralelogram('pr1', 100, 100, [Math.SQRT2 / 2, Math.SQRT2 / 2], 0),
        ] as Shape[];
    }
}

export {
    Tangram
}