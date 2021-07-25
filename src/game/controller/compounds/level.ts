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

class Level implements Drawable{
    store: {
        game: Tangram | null
    }
    shapes: Set<Shape>;
    vertices: Set<Vertex>;
    errorIndex: number;

    constructor(){
        bindAllMethods(this);

        this.shapes = new Set();
        this.vertices = new Set();
        this.errorIndex = 15;

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

    proveLevel(){
        const levelShapes = new Set(this.shapes);
        const gameShapes = new Set(this.game.shapes);

        const resolved = new Set<Shape>();

        for(const levelShape of levelShapes){
            for(const gameShape of gameShapes){
                if(levelShape.store.id === gameShape.store.id){
                    
                    let test = true;
                    test = test && levelShape.rotation === gameShape.rotation;
                    test = test && Math.abs(levelShape.x - gameShape.x) < this.errorIndex;
                    test = test && Math.abs(levelShape.y - gameShape.y) < this.errorIndex;
                    
                    if(test){
                        resolved.add(gameShape);
                        gameShapes.delete(gameShape);
                        break;
                    }
                }
            }
        }

        return gameShapes.size === 0;
    }

    static importLevel(levelSrc: string | GameLevel){
        return (game: Tangram)=>{
            if(typeof levelSrc === 'string'){
                levelSrc = JSON.parse(levelSrc) as GameLevel;
            }
    
            const level = new Level();
            const shapes = new Set(Tangram.getShapes());
            level.shapes = new Set(shapes);

            level.init(game);

            for(const shape of shapes){
                shape.init(game);
            }
    
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
            level.errorIndex = levelSrc.errorIndex;
    
            return level;
        }
    }

    static exportLevel(level: Level){
        const levelSrc: GameLevel = {
            vertices: [...level.vertices],
            shapes: [...level.shapes].map(s=>({
                id: s.store.id,
                x: s.x,
                y: s.y,
                size: [s.size.w, s.size.h],
                rotation: s.rotation,
            })),
            errorIndex: level.errorIndex
        };

        const encoded = JSON.stringify(levelSrc, null, 4);
        const encodedB64 = b64enc(encoded);
        downloadBase64(encodedB64, 'application/json', 'level_export.json')
    }
}

export {
    Level
}
