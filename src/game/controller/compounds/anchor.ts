import {
    bindAllMethods,
    downloadBase64,
    b64enc
} from '@tangram-util';

import {
    theme
} from '@tangram-core';

import {
    Vertex,
    BarycenterSet,
    BarycenterCoord,
    Drawable,
    GameLevel,
    Shape,

    Tangram
} from '@tangram-game';

class Anchor implements Drawable{
    store: {
        x: number,
        y: number,
        selected: number | null,

        game: Tangram | null
    }

    constructor(x: number, y: number) {
        bindAllMethods(this);

        this.store = {
            x: x,
            y: y,
            selected: null,
    
            game: null
        }
    }

    init(tangram: Tangram): void {
        this.store.game = tangram;
    }

    /* getters / setters */

    get x() {
        return this.store.x;
    }

    set x(v: number) {
        this.store.x = Math.min(Math.max(v, 20), this.game.size.w - 20);
    }

    get y() {
        return this.store.y;
    }

    set y(v: number) {
        this.store.y = Math.min(Math.max(v, 20), this.game.size.h - 20);
    }

    get game() {
        if (this.store.game) {
            return this.store.game;
        }
        throw new Error('No game is bound');
    }

    draw(): void{
        const ctx = this.game.ctx;
        
        ctx.strokeStyle = '#00FF00';
        if(this.store.selected !== null){
            ctx.strokeStyle = '#0000FF';
        }
        ctx.lineWidth = 1;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(this.x-2, this.y-2);
        ctx.lineTo(this.x+2, this.y+2);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x+2, this.y-2);
        ctx.lineTo(this.x-2, this.y+2);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x-8, this.y-8);
        ctx.lineTo(this.x+8, this.y-8);
        ctx.lineTo(this.x+8, this.y+8);
        ctx.lineTo(this.x-8, this.y+8);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    drawDebug(): void{

    }

    isCoordOver(x: number, y: number){
        return (
            this.x-8 < x && this.y-8 < y
            &&
            this.x+8 > x && this.y+8 > y
        );
    }

    onMouseEvent(x: number, y: number, event: MouseEvent){
        if(event.type === 'click'){
            if(this.isCoordOver(x, y)){
                if(this.store.selected !== null){
                    this.store.selected = null;
                }else{
                    this.store.selected = Date.now();
                }
            }
        }
    }
}

export {
    Anchor
}