import {
    bindAllMethods
} from '@tangram-util';

import {
    theme
} from '@tangram-core';

import {
    Shape,
    Vertex,
    Square,
    Triangle,
    Paralelogram
} from './shapes';

import {
    Anchor
} from './anchor';

class Tangram {
    anchors: Set<Anchor>;
    shapes: Set<Shape>;
    selectedShape: Shape | null;
    hoveredShape: Shape | null;
    tickerId: number | null;
    flags: {
        snaping: boolean,
        debugLevel: number,
        drawLevel: boolean,
        drawAnchors: boolean
    };

    _size: {
        w: number,
        h: number
    } | null;
    _canvas: HTMLCanvasElement | null;
    _ctx: CanvasRenderingContext2D | null;
    _forceReactUpdate: (() => void) | null;


    constructor() {
        bindAllMethods(this);

        this._ctx = null;
        this._canvas = null;
        this._size = null;
        this._forceReactUpdate = null;

        this.anchors = new Set();
        this.shapes = new Set();
        this.selectedShape = null;
        this.hoveredShape = null;
        this.tickerId = null;

        this.flags = {
            snaping: false,
            debugLevel: 0,
            drawLevel: false,
            drawAnchors: false
        };
    }

    set ctx(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    get ctx() {
        if (this._ctx) {
            return this._ctx;
        }
        throw new Error('ctx not bound');
    }

    set canvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    get canvas() {
        if (this._canvas) {
            return this._canvas;
        }
        throw new Error('canvas not bound');
    }

    set size(size: {
        w: number,
        h: number
    }) {
        this._size = size;
    }

    get size() {
        if (this._size) {
            return this._size;
        }
        throw new Error('size not bound');
    }

    set forceReactUpdate(fn: () => void) {
        this._forceReactUpdate = fn;
    }

    get forceReactUpdate() {
        if (this._forceReactUpdate) {
            return this._forceReactUpdate;
        }
        throw new Error('forceReactUpdate not bound');
    }

    settleSize() {
        this.size = {
            w: this.canvas.width,
            h: this.canvas.height
        };
    }

    startGame() {
        const shapes = [
            new Square('sq1', 100, 100, [1, 1], 45),
            new Triangle('tr1', 100, 100, [1, 1], -45),
            new Triangle('tr2', 100, 100, [2, 2], 45),
            new Triangle('tr3', 100, 100, [2, 2], 135),
            new Triangle('tr4', 100, 100, [1, 1], 225),
            new Triangle('tr5', 100, 100, [Math.SQRT2, Math.SQRT2], 90),
            new Paralelogram('pr1', 100, 100, [Math.SQRT2 / 2, Math.SQRT2 / 2], 0),
        ].map(sh => {
            sh.size.w *= 50;
            sh.size.h *= 50;
            sh.x = (Math.floor(Math.random() * 10000) % (this.size.w - 200)) + 200;
            sh.y = (Math.floor(Math.random() * 10000) % (this.size.h - 200)) + 200;
            sh.rotation = (Math.floor(Math.random() * 100) * 45) % 360;
            return sh;
        });

        this.addShapes(shapes);

        this.addHandlers();
        this.startTicker();
    }

    startTicker() {
        this.tickerId = window.requestAnimationFrame(this.tick);
    }

    stopTicker() {
        if (this.tickerId !== null) {
            window.cancelAnimationFrame(this.tickerId);
            this.tickerId = null;
        }
    }

    tick() {
        this.ctx.clearRect(0, 0, this.size.w, this.size.h);

        this.canvas.style.cursor = this.hoveredShape !== null ? 'pointer' : 'default';

        if(this.flags.drawAnchors){
            for(const anchor of this.anchors){
                anchor.draw();
    
                if (this.flags.debugLevel >= 1) {
                    anchor.drawDebug();
                }
            }
        }
        if(this.flags.drawLevel){
            const ctx = this.ctx;
            
            ctx.strokeStyle = theme.c.e();
            ctx.lineWidth = 3;


            ctx.save();
            ctx.beginPath();

            const anchors = [...this.anchors]
                .filter(a=>a.selected)
                .sort((a, b)=>a.selectedAt - b.selectedAt);
            
            for(const [index, vertex] of anchors.entries()){
                if(index === 0){
                    ctx.moveTo(vertex.x, vertex.y);
                }else{
                    ctx.lineTo(vertex.x, vertex.y);
                }
            }

            ctx.closePath();

            ctx.stroke();

            ctx.restore();
        }
        
        if(!this.flags.drawAnchors){
            for (const shape of this.shapes) {
                shape.draw();
    
                if (this.flags.debugLevel >= 1) {
                    shape.drawDebug();
                }
            }
    
            if (this.flags.snaping) {
                this.tickSnaping();
            }
        }

        if (this.flags.debugLevel >= 1) {
            this.tickDebug();
        }

        this.tickerId = window.requestAnimationFrame(this.tick);
    }

    tickSnaping() {
        const visited = new Set<Shape>();
        for (const shapeA of this.shapes) {

            const vertexAC = shapeA.getCenterVertex();
            visited.add(shapeA);

            for (const shapeB of [...this.shapes].filter(s => !visited.has(s))) {
                const vertexBC = shapeB.getCenterVertex();

                if (shapeA.distanceVertices(vertexAC, vertexBC) < 100) {
                    const verticesA = shapeA.getVertices();
                    const verticesB = shapeB.getVertices();

                    for (const vertexA of verticesA) {
                        for (const vertexB of verticesB) {

                            if (shapeA.distanceVertices(vertexA, vertexB) < 30) {
                                const origin = Object.is(this.selectedShape, shapeA) ? shapeA : shapeB;

                                const originVertex = Object.is(this.selectedShape, shapeA) ? vertexA : vertexB;
                                const remoteVertex = !Object.is(this.selectedShape, shapeA) ? vertexA : vertexB;

                                const [mx, my] = [remoteVertex.x - originVertex.x, remoteVertex.y - originVertex.y];
                                origin.x += mx;
                                origin.y += my;

                                /* this.selectedShape = null; */
                            }
                        }
                    }
                }
            }
        }
    }

    tickDebug() {
        if (this.flags.debugLevel >= 2) {
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

        if (this.flags.debugLevel >= 3) {
            const visited = new Set<Shape>();
            for (const shapeA of this.shapes) {

                const vertexAC = shapeA.getCenterVertex();
                visited.add(shapeA);

                for (const shapeB of [...this.shapes].filter(s => !visited.has(s))) {
                    const vertexBC = shapeB.getCenterVertex();

                    if (shapeA.distanceVertices(vertexAC, vertexBC) < 100) {
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

    setAnchors(){
        if(this.flags.drawAnchors){
            this.flags.drawAnchors = false;
            this.anchors = new Set();
        }else{
            this.flags.drawAnchors = true;

            for(const shape of this.shapes){
                for(const vertex of shape.getVertices()){
                    const anchor = new Anchor(vertex.x, vertex.y);
                    anchor.init(this);
                    this.anchors.add(anchor);
                }
            }
        }

        this.forceReactUpdate();
    }

    saveLevel(){

    }

    addShapes(shapes: (Shape | ((tangram: Tangram) => Shape))[]) {
        for (const shapeLike of shapes) {
            const shape = shapeLike instanceof Shape ? shapeLike : shapeLike(this);
            shape.init(this);
            this.shapes.add(shape);
        }
    }

    addHandlers() {
        this.canvas.addEventListener('mousedown', this.onMouseEvent);
        this.canvas.addEventListener('mouseup', this.onMouseEvent);
        this.canvas.addEventListener('mousemove', this.onMouseEvent);
        this.canvas.addEventListener('click', this.onMouseEvent);
    }

    onMouseEvent(event: MouseEvent) {
        if(this.flags.drawAnchors){
            for (const anchor of this.anchors) {
                anchor.onMouseEvent(
                    event.offsetX,
                    event.offsetY,
                    event
                );
            }
        }
        if(this.flags.drawLevel){

        }
        if(!this.flags.drawAnchors){
            for (const shape of this.shapes) {
                shape.onMouseEvent(
                    event.offsetX,
                    event.offsetY,
                    event
                );
            }
        }
    }
}

export {
    Tangram
}