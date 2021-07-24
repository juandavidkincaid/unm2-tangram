import {
    bindAllMethods
} from '@tangram-util';

import {
    theme
} from '@tangram-core';

import {Tangram} from '..';

type Vertex = {
    x: number,
    y: number
};

type BarycenterSet = {
    a: Vertex,
    b: Vertex,
    c: Vertex
}

abstract class Shape {
    id: string;
    x: number;
    y: number;
    size: {
        w: number,
        h: number
    };
    _rotation: number;
    flipped: boolean;
    hovered: boolean;
    ismoving: boolean;


    _game: Tangram | null;

    constructor(id: string, x: number, y: number, size: [number, number], rotation: number) {
        bindAllMethods(this);

        this.id = id;
        this.x = x;
        this.y = y;
        this.size = {
            w: size[0],
            h: size[1]
        };
        this._rotation = rotation;
        this.flipped = false;
        this.hovered = false;
        this.ismoving = false;

        this._game = null;
    }

    get rotation(){
        return this._rotation;
    }

    set rotation(value: number){
        this._rotation = Math.abs(value % 360);
    }

    get game(){
        if(this._game){
            return this._game;
        }
        throw new Error('No game is bound');
    }

    get selected(){
        return Object.is(this, this.game.selectedShape);
    }

    abstract getVertices(): Vertex[];
    abstract getCenterVertex(): Vertex;
    abstract getBarycenterSets(): BarycenterSet[];

    draw(): void{
        const ctx = this.game.ctx;
        

        ctx.fillStyle = theme.c.e();
        ctx.strokeStyle = theme.c.e();
        ctx.lineWidth = 1;

        if(this.hovered || this.selected){
            ctx.fillStyle = theme.c.b();
            ctx.strokeStyle = theme.c.e();
            ctx.lineWidth = 5;
        }

        ctx.save();
        ctx.beginPath();

        const vertices = this.getVertices();
        
        for(const [index, vertex] of vertices.entries()){
            if(index === 0){
                ctx.moveTo(vertex.x, vertex.y);
            }else{
                ctx.lineTo(vertex.x, vertex.y);
            }
        }

        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }

    drawBarycenterTriangles(){        
        const ctx = this.game.ctx;

        const barycentersets = this.getBarycenterSets();
        

        for(const bs of barycentersets){
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 1;

            ctx.save();
            ctx.beginPath();

            ctx.moveTo(bs.a.x, bs.a.y);
            ctx.lineTo(bs.b.x, bs.b.y);
            ctx.lineTo(bs.c.x, bs.c.y);

            ctx.closePath();

            ctx.stroke();

            ctx.restore();
        }
    }

    drawDebug(): void{
        this.drawBarycenterTriangles();

        /* this.rotation++; */
    }

    init(tangram: Tangram): void{
        this._game = tangram;
    }

    isCoordOver(x: number, y: number){
        const barycentersets = this.getBarycenterSets();
        const bsCoords = barycentersets.map(bs=>this.barycentricCoordinate(bs, {x, y}));
        return bsCoords.some(bs=>(
            bs.a >= 0 && bs.b >= 0 && bs.c >= 0
        ));
    }

    onMouseEvent(x: number, y: number, event: MouseEvent){
        
        if(event.type === 'mousemove'){
            this.hovered = this.isCoordOver(x, y);
            this.game.hoveredShape = this.hovered ? this : null;

            if(this.ismoving){
                this.x += event.movementX;
                this.y += event.movementY;


            }
        }

        if(event.type === 'mousedown'){
            if(this.hovered){
                this.ismoving = true;
            }
        }

        if(event.type === 'mouseup'){
            if(this.ismoving){
                this.ismoving = false;
            }
        }

        if(event.type === 'click'){
            if(this.hovered){
                this.game.selectedShape = this;
            }
        }
    }

    /* Helpers */

    barycentricCoordinate(bs: BarycenterSet, vertex: Vertex){
        const detT = (
            ( (bs.b.y - bs.c.y) * (bs.a.x - bs.c.x) )
            +
            ( (bs.c.x - bs.b.x) * (bs.a.y - bs.c.y) )
        );

        const a = (
            ( (bs.b.y - bs.c.y) * (vertex.x - bs.c.x) )
            +
            ( (bs.c.x - bs.b.x) * (vertex.y - bs.c.y) )
        ) / detT;

        const b = (
            ( (bs.c.y - bs.a.y) * (vertex.x - bs.c.x) )
            +
            ( (bs.a.x - bs.c.x) * (vertex.y - bs.c.y) )
        ) / detT;

        const c = 1 - a - b;

        return {a, b, c};
    }

    distanceVertices(a: Vertex, b: Vertex){
        return Math.sqrt(
            Math.abs(a.x - b.x) ** 2
            +
            Math.abs(a.y - b.y) ** 2
        );
    }

    rotateVertex(origin: Vertex, vertex: Vertex, deg: number){
        deg = deg % 360;
        const rad = deg * (Math.PI / 180);
        return {
            x: origin.x + (vertex.x - origin.x) * Math.cos(rad) - (vertex.y - origin.y) * Math.sin(rad),
            y: origin.y + (vertex.x - origin.x) * Math.sin(rad) + (vertex.y - origin.y) * Math.cos(rad),
        }
    }
}

export {
    Shape,
    Vertex,
    BarycenterSet
}