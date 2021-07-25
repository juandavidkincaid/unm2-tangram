import {
    bindAllMethods
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

class Level implements Drawable{
    store: {
        game: Tangram | null
    }
    shapes: Set<Shape>;
    vertices: Set<Vertex>;

    constructor(){
        bindAllMethods(this);

        this.shapes = new Set();
        this.vertices = new Set();

        this.store = {
            game: null
        };
    }

    init(tangram: Tangram): void {
        this.store.game = tangram;
    }

    get game() {
        if (this.store.game) {
            return this.store.game;
        }
        throw new Error('No game is bound');
    }

    draw(){
        const ctx = this.game.ctx;
            
        ctx.strokeStyle = theme.c.e();
        ctx.lineWidth = 3;


        ctx.save();
        ctx.beginPath();

        
        
        for(const [index, vertex] of [...this.vertices].entries()){
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

    drawDebug(){
        
    }

    static importLevel(levelSrc: string | GameLevel){
        if(typeof levelSrc === 'string'){
            levelSrc = JSON.parse(levelSrc) as GameLevel;
        }

        const level = new Level();
        const shapes = new Set(Tangram.getShapes());
        level.shapes = new Set(shapes);

        for(const shapeSrc of levelSrc.shapes){
            for(const shape of shapes){
                if(shape.store.id === shapeSrc.id){
                    shape.x = shapeSrc.x;
                    shape.y = shapeSrc.y;
                    shape.rotation = shapeSrc.rotation;
                    shape.size.w = shapeSrc.size[0];
                    shape.size.h = shapeSrc.size[1];

                    shapes.delete(shape);
                    break;
                }
            }
        }

        level.vertices = new Set(levelSrc.vertices);

        return level;
    }

    static exportLevel(){

    }
}

export {
    Level
}
