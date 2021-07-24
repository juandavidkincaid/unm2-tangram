import {
    theme
} from '@tangram-core';

import {Shape} from '.';

class Triangle extends Shape {
    get drawCoords(){
        return {
            x: this.x - (this.size.w / 2),
            y: this.y - (this.size.h / 2),
            xz: 0 - (this.size.w / 2),
            yz: 0 - (this.size.h / 2),
        }
    }

    getBaseVertices(){
        return [
            {x: this.drawCoords.x, y: this.drawCoords.y},
            {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y},
            {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.w},
        ];
    }

    getCenterVertex(){
        const vertices = this.getBaseVertices();
        const sums = vertices.reduce((sums, v)=>{
            sums.xSum += v.x;
            sums.ySum += v.y;
            return sums;
        }, {xSum: 0, ySum: 0});
        return {
            x: sums.xSum / vertices.length,
            y: sums.ySum / vertices.length,
        }
    }

    getVertices(){
        return this.getBaseVertices().map(
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
                c: {x: this.drawCoords.x + this.size.w, y: this.drawCoords.y + this.size.w},
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
    Triangle
}