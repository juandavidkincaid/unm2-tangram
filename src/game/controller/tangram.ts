import {
    bindAllMethods
} from '@tangram-util';

import {
    Shape,
    Square,
    Triangle,
    Paralelogram
} from './shapes';

class Tangram {
    shapes: Set<Shape>;
    selectedShape: Shape | null;
    hoveredShape: Shape | null;
    tickerId: number | null;
    debug: boolean;
    size: {
        w: number,
        h: number
    };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;


    constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, debug: boolean = false) {
        bindAllMethods(this);

        this.ctx = ctx;
        this.canvas = canvas;
        this.size = {
            w: canvas.width, 
            h: canvas.height
        };
        this.shapes = new Set();
        this.selectedShape = null;
        this.hoveredShape = null;
        this.debug = debug;
        this.tickerId = null;
    }

    settleSize(){
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
            new Paralelogram('pr1', 100, 100, [Math.SQRT2/2, Math.SQRT2/2], 0),
        ].map(sh=>{
            sh.size.w *= 50;
            sh.size.h *= 50;
            sh.x = (Math.floor(Math.random() * 10000) % (this.size.w - 200)) + 200;
            sh.y = (Math.floor(Math.random() * 10000) % (this.size.h - 200)) + 200;
            // sh.rotation = (Math.floor(Math.random() * 100) * 45) % 360;
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
        this.ctx.clearRect(0,0, this.size.w, this.size.h);

        this.canvas.style.cursor = this.hoveredShape !== null ? 'pointer' : 'default';

        for (const shape of this.shapes) {
            shape.draw();

            if (this.debug) {
                shape.drawDebug();
            }
        }

        this.tickerId = window.requestAnimationFrame(this.tick);
    }

    addShapes(shapes: (Shape | ((tangram: Tangram) => Shape))[]) {
        for (const shapeLike of shapes) {
            const shape = shapeLike instanceof Shape ? shapeLike : shapeLike(this);
            shape.init(this);
            this.shapes.add(shape);
        }
    }

    addHandlers(){
        this.canvas.addEventListener('mousedown', this.onMouseEvent);
        this.canvas.addEventListener('mouseup', this.onMouseEvent);
        this.canvas.addEventListener('mousemove', this.onMouseEvent);
    }

    onMouseEvent(event: MouseEvent){
        for(const shape of this.shapes){
            shape.onMouseEvent(
                event.offsetX,
                event.offsetY,
                event
            );
        }
    }
}

export {
    Tangram
}