import {
    theme
} from '@tangram-core';

import {Shape} from '.';

class Square extends Shape {
    get drawCoords(){
        return {
            x: this.x - (this.size.w / 2),
            y: this.y - (this.size.h / 2),
            xz: 0 - (this.size.w / 2),
            yz: 0 - (this.size.h / 2),
        }
    }

    getCenterVertex(){
        return {x: this.x, y: this.y};
    }

    getVertices(){
        return [
            {x: this.drawCoords.x, y: this.drawCoords.y},
            {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y},
            {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.h},
            {x: this.drawCoords.x, y: this.drawCoords.y + this.size.h}
        ].map(
            v=>this.rotateVertex(
                this.getCenterVertex(),
                v,
                this.rotation
            )
        );
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
    Square
}