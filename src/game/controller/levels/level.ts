import {
    bindAllMethods
} from '@tangram-util';

import {
    theme
} from '@tangram-core';

import {
    Tangram,
    Vertex,
    Anchor,
    Shape
} from '.';

type TangramLevel = {
    vertices: Vertex[];
    shapes: {
        id: string,
        size: [number, number],
        x: number, y: number,
        rotation: number
    }[];
}

class Level {
    anchors: Set<Anchor>;
    shapes: Set<Shape>;


    _game: Tangram | null;

    constructor() {
        bindAllMethods(this);

        this.anchors = new Set();
        this.shapes = new Set();

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
        
        

        ctx.restore();
    }

    drawDebug(): void{

    }

    init(tangram: Tangram): void{
        this._game = tangram;
    }

    static importLevel(resource: any){
        let levelr: TangramLevel;
        if(typeof resource === 'string'){
            levelr = JSON.parse(resource);
        }else{
            levelr = resource;
        }

        const level = new Level();

        const dShapes = new Set(Tangram.getShapes());
        const orgDShapes = new Set(dShapes);

        for(const shape of levelr.shapes){
            for(const dShape of dShapes){
                if(shape.id === dShape.id){
                    dShape.x = shape.x;
                    dShape.y = shape.y;
                    dShape.rotation = shape.rotation;
                    dShape.size.w = shape.size[0];
                    dShape.size.h = shape.size[1];

                    dShapes.delete(dShape);
                }
            }
        }

        const anchors = new Set<Anchor>();
        level.shapes = orgDShapes;
        
        for(const vertex of levelr.vertices){

        }
    }

    static exportLevel(level: Level){

    }
}

export {
    Level
}