import {
    theme
} from '@tangram-core';

import {Shape} from '.';
import {Tangram} from '..';

class Paralelogram extends Shape {
    get drawCoords(){
        return {
            x: this.x - (this.size.w / 2),
            y: this.y - (this.size.h / 2),
            xz: 0 - (this.size.w / 2),
            yz: 0 - (this.size.h / 2),
        }
    }

    get rotation(){
        return this._rotation;
    }

    set rotation(value: number){
        this._rotation = Math.abs(value % 180);
        console.log(this._rotation);
    }

    getCenterVertex(){
        return {x: this.x, y: this.y};
    }
    
    getVertices(){
        return [
            {x: this.drawCoords.x, y: this.drawCoords.y},
            {x: this.drawCoords.x + this.size.w * 2, y: this.drawCoords.y},
            {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.h},
            {x: this.drawCoords.x - this.size.w, y: this.drawCoords.y + this.size.h}
        ].map(
            v=>this.rotateVertex(
                this.getCenterVertex(),
                v,
                this.rotation
            )
        );;
    }

    getBarycenterSets(){
        return [
            {
                a: {x: this.drawCoords.x, y: this.drawCoords.y},
                b: {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y},
                c: {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.h},
            },
            {
                a: {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.h},
                b: {x: this.drawCoords.x, y: this.drawCoords.y + this.size.h},
                c: {x: this.drawCoords.x, y: this.drawCoords.y},
            },
            {
                a: {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y},
                b: {x: this.drawCoords.x + this.size.w * 2, y: this.drawCoords.y},
                c: {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.h},
            },
            {
                a: {x: this.drawCoords.x, y: this.drawCoords.y},
                b: {x: this.drawCoords.x, y: this.drawCoords.y + this.size.h},
                c: {x: this.drawCoords.x - this.size.w, y: this.drawCoords.y + this.size.h},
            }
        ].map(
            bs=>{
                bs.a = this.rotateVertex(this.getCenterVertex(), bs.a, this.rotation);
                bs.b = this.rotateVertex(this.getCenterVertex(), bs.b, this.rotation);
                bs.c = this.rotateVertex(this.getCenterVertex(), bs.c, this.rotation);
                return bs;
            }
        );
    }
}

export {
    Paralelogram
}