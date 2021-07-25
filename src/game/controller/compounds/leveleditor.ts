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
    Anchor,
    Level,

    Tangram
} from '@tangram-game';

class LevelEditor implements Drawable{
    store: {
        game: Tangram | null,
        anchors: Set<Anchor>,
        storedDrawModes: Tangram["store"]["flags"]["drawModes"],
        editing: boolean
    }

    constructor(){
        bindAllMethods(this);

        this.store = {
            game: null,
            anchors: new Set(),
            storedDrawModes: new Set(),
            editing: false
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
        if(this.game.drawModes.has('editor-level')){
            const ctx = this.game.ctx;

            ctx.strokeStyle = theme.c.e();
            ctx.lineWidth = 3;

            ctx.save();
            ctx.beginPath();

            const anchors = [...this.store.anchors]
                .filter(a=>a.store.selected !== null)
                .sort((a, b)=>{
                    if(a.store.selected !== null && b.store.selected !== null){
                        return a.store.selected - b.store.selected;
                    }
                    return 0;
                });

            for(const [index, vertex] of anchors.entries()){
                if (index === 0) {
                    ctx.moveTo(vertex.x, vertex.y);
                } else {
                    ctx.lineTo(vertex.x, vertex.y);
                }
            }

            ctx.closePath();

            ctx.stroke();
            ctx.fill();

            ctx.restore();
        }

        if(this.game.drawModes.has('editor-anchors')){
            for(const anchor of this.store.anchors){
                anchor.draw();
            }
        }

    }

    drawDebug(){
        if(this.game.drawModes.has('editor-anchors')){
            for(const anchor of this.store.anchors){
                anchor.drawDebug();
            }
        }
    }

    edit(){
        if(this.store.editing){
            this.game.drawModes = this.store.storedDrawModes;
            this.store.editing = false;
            return;
        }else{
            this.store.storedDrawModes = this.game.drawModes;
            this.game.drawModes = new Set();
            this.game.drawModes.add('editor-anchors');
            this.store.anchors = new Set();

            for(const shape of this.game.shapes){
                for(const vertex of shape.getVertices()){
                    const anchor = new Anchor(vertex.x, vertex.y);
                    anchor.init(this.game);
                    this.store.anchors.add(anchor);
                }
            }
            this.store.editing = true;
        }
        this.game.forceReactUpdate();
    }

    export(){
        const level = new Level();
        level.shapes = new Set(this.game.shapes);
        level.vertices = new Set([...this.store.anchors]
            .filter(a=>a.store.selected !== null)
            .sort((a, b)=>{
                if(a.store.selected !== null && b.store.selected !== null){
                    return a.store.selected - b.store.selected;
                }
                return 0;
            })
            .map(a=>({
                x: a.x,
                y: a.y
            })));
        
        Level.exportLevel(level);
    }

    onMouseEvent(x: number, y: number, event: MouseEvent){
        for(const anchor of this.store.anchors){
            anchor.onMouseEvent(x, y, event);
        }
    }
}

export {
    LevelEditor
}
