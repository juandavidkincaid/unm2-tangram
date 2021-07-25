import {
    theme
} from '@tangram-core';

import {
    Shape
} from '@tangram-game/shapes/shape';

class Triangle extends Shape {
    get drawCoords(){
        return {
            x: this.x - (this.size.w / 2),
            y: this.y - (this.size.h / 2),
            xz: 0 - (this.size.w / 2),
            yz: 0 - (this.size.h / 2),
        }
    }

    getRelativeCenterDeltas(){
        const vertices = [
            {x: 0, y: 0},
            {x: this.size.w, y: 0},
            {x: 0, y: this.size.h},
        ];

        const sums = vertices.reduce((sums, v)=>{
            sums.xSum += v.x;
            sums.ySum += v.y;
            return sums;
        }, {xSum: 0, ySum: 0});
        
        const center = {
            x: sums.xSum / vertices.length,
            y: sums.ySum / vertices.length,
        };

        return vertices.map(v=>{
            v.x -= center.x;
            v.y -= center.y;
            return v;
        });
    }

    getBaseVertices(){
        const centerDeltaVxs = this.getRelativeCenterDeltas();
        return centerDeltaVxs.map(dvx=>{
            dvx.x = this.x + dvx.x;
            dvx.y = this.y + dvx.y;
            return dvx;
        });
    }

    getCenterVertex(){
        return {x: this.x, y: this.y};
    }

    getVertices(){
        return this.getBaseVertices().map(
            v=>Shape.rotateVertex(
                this.getCenterVertex(),
                v,
                this.rotation
            )
        );
    }

    getBarycenterSets(){
        const baseVxs = this.getBaseVertices();
        return [
            {
                a: baseVxs[0],
                b: baseVxs[1],
                c: baseVxs[2],
            }
        ].map(
            bs=>{
                bs.a = Shape.rotateVertex(this.getCenterVertex(), bs.a, this.rotation);
                bs.b = Shape.rotateVertex(this.getCenterVertex(), bs.b, this.rotation);
                bs.c = Shape.rotateVertex(this.getCenterVertex(), bs.c, this.rotation);
                return bs;
            }
        );
    }
}

export {
    Triangle
}