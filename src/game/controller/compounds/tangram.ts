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

import {
    Level
} from './level';

class Tangram {


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
}

export {
    Tangram
}