import {
    bindAllMethods
} from '@tangram-util';

import {
    theme
} from '@tangram-core';

import {
    Tangram
} from '.';

class Anchor {
    x: number;
    y: number;
    selected: boolean;
    selectedAt: number;


    _game: Tangram | null;

    constructor(x: number, y: number) {
        bindAllMethods(this);

        this.x = x;
        this.y = y;
        this.selected = false;
        this.selectedAt = NaN;

        this._game = null;
    }

    get game(){
        if(this._game){
            return this._game;
        }
        throw new Error('No game is bound');
    }

    draw(): void{
        const ctx = this.game.ctx;
        
        ctx.strokeStyle = '#00FF00';
        if(this.selected){
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

    init(tangram: Tangram): void{
        this._game = tangram;
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
                this.selected = !this.selected;
                this.selectedAt = Date.now();
            }
        }
    }
}

export {
    Anchor
}