import {
    bindAllMethods
} from '@tangram-util';

import {
    Vertex,
    BarycenterSet,
    BarycenterCoord,
    Drawable,

    Tangram
} from '@tangram-game';

class LevelEditor implements Drawable{
    constructor(){
        bindAllMethods(this);
    }

    draw(){

    }

    drawDebug(){
        
    }
}

export {
    LevelEditor
}
