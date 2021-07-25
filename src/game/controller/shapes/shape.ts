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

    Tangram
} from '@tangram-game';

abstract class Shape implements Drawable{
    store: {
        id: string,
        x: number,
        y: number,
        ax: number,
        ay: number,
        size: {
            w: number,
            h: number
        },
        rotation: number,

        flags: {
            move: boolean,
            hover: boolean,
            flip: boolean
        },

        game: Tangram | null
    }

    constructor(id: string, x: number, y: number, size: [number, number], rotation: number) {
        bindAllMethods(this);

        this.store = {
            id: id,
            x: x,
            y: y,
            ax: x,
            ay: y,
            size: {
                w: size[0],
                h: size[1]
            },
            rotation: rotation,

            flags: {
                move: false,
                hover: false,
                flip: false
            },

            game: null
        };
    }

    init(tangram: Tangram): void {
        this.store.game = tangram;
    }

    isCoordOver(x: number, y: number) {
        const barycentersets = this.getBarycenterSets();
        const bsCoords = barycentersets.map(bs => Shape.barycentricCoordinate(bs, { x, y }));
        return bsCoords.some(bs => (
            bs.a >= 0 && bs.b >= 0 && bs.c >= 0
        ));
    }

    onMouseEvent(x: number, y: number, event: MouseEvent) {

        if (event.type === 'mousemove') {
            this.store.flags.hover = this.isCoordOver(x, y);

            if (this.store.flags.move) {
                this.x += event.movementX;
                this.y += event.movementY;

                if (this.game.store.flags.snap) {
                    const originVC = this.getCenterVertex();

                    for (const remote of this.game.shapes) {
                        if (Object.is(remote, this)) {
                            continue;
                        }

                        const remoteVC = remote.getCenterVertex();

                        if (Shape.distanceVertices(originVC, remoteVC) < 150) {
                            const originVxs = this.getVertices();
                            const remoteVxs = remote.getVertices();

                            for (const originVx of originVxs) {
                                for (const remoteVx of remoteVxs) {

                                    if (Shape.distanceVertices(originVx, remoteVx) < 30) {
                                        const [mx, my] = [remoteVx.x - originVx.x, remoteVx.y - originVx.y];
                                        this.x += mx;
                                        this.y += my;

                                        /* this.selected = null; */
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }

        if (event.type === 'mousedown') {
            if (this.store.flags.hover) {
                this.store.flags.move = true;
            }
        }

        if (event.type === 'mouseup') {
            if (this.store.flags.move) {
                this.store.flags.move = false;
            }
        }

        if (event.type === 'click') {
            if (this.store.flags.hover) {
                this.game.selected = this;
            }
        }
    }

    /* getters / setters */

    get x() {
        return this.store.x;
    }

    set x(v: number) {
        this.store.x = Math.min(Math.max(v, 20), this.game.size.w - 20);
    }

    get y() {
        return this.store.y;
    }

    set y(v: number) {
        this.store.y = Math.min(Math.max(v, 20), this.game.size.h - 20);
    }

    get ax() {
        return this.store.ax;
    }

    set ax(v: number) {
        this.store.ax = Math.min(Math.max(v, 20), this.game.size.w - 20);
    }

    get ay() {
        return this.store.ay;
    }

    set ay(v: number) {
        this.store.ay = Math.min(Math.max(v, 20), this.game.size.h - 20);
    }

    get rotation() {
        return this.store.rotation;
    }

    set rotation(value: number) {
        value = value % 360;
        value = value < 0 ? 360 + value : value;
        this.store.rotation = Math.abs(value);
    }

    get game() {
        if (this.store.game) {
            return this.store.game;
        }
        throw new Error('No game is bound');
    }

    get selected() {
        return Object.is(this, this.game.selected);
    }

    get size(){
        return this.store.size;
    }

    /* abtracts */

    abstract getVertices(): Vertex[];
    abstract getCenterVertex(): Vertex;
    abstract getBarycenterSets(): BarycenterSet[];

    /* Rendering */

    draw(): void {
        const ctx = this.game.ctx;


        ctx.fillStyle = theme.c.e();
        ctx.strokeStyle = theme.c.e();
        ctx.lineWidth = 1;

        if (this.store.flags.hover || this.selected) {
            ctx.fillStyle = theme.c.b();
            ctx.strokeStyle = theme.c.e();
            ctx.lineWidth = 5;
        }

        ctx.save();
        ctx.beginPath();

        const vertices = this.getVertices();

        for (const [index, vertex] of vertices.entries()) {
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

    drawBarycenterTriangles() {
        const ctx = this.game.ctx;

        const barycentersets = this.getBarycenterSets();


        for (const bs of barycentersets) {
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

    drawDebug(): void {
        this.drawBarycenterTriangles();

        const ctx = this.game.ctx;


        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 1;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y - 2);
        ctx.lineTo(this.x + 2, this.y + 2);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + 2, this.y - 2);
        ctx.lineTo(this.x - 2, this.y + 2);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y - 8);
        ctx.lineTo(this.x + 8, this.y - 8);
        ctx.lineTo(this.x + 8, this.y + 8);
        ctx.lineTo(this.x - 8, this.y + 8);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        /* this.rotation++; */
    }

    /* Helpers */

    static barycentricCoordinate(bs: BarycenterSet, vertex: Vertex) {
        const detT = (
            ((bs.b.y - bs.c.y) * (bs.a.x - bs.c.x))
            +
            ((bs.c.x - bs.b.x) * (bs.a.y - bs.c.y))
        );

        const a = (
            ((bs.b.y - bs.c.y) * (vertex.x - bs.c.x))
            +
            ((bs.c.x - bs.b.x) * (vertex.y - bs.c.y))
        ) / detT;

        const b = (
            ((bs.c.y - bs.a.y) * (vertex.x - bs.c.x))
            +
            ((bs.a.x - bs.c.x) * (vertex.y - bs.c.y))
        ) / detT;

        const c = 1 - a - b;

        return { a, b, c };
    }

    static distanceVertices(a: Vertex, b: Vertex) {
        return Math.sqrt(
            Math.abs(a.x - b.x) ** 2
            +
            Math.abs(a.y - b.y) ** 2
        );
    }

    static rotateVertex(origin: Vertex, vertex: Vertex, deg: number) {
        deg = deg % 360;
        const rad = deg * (Math.PI / 180);
        return {
            x: origin.x + (vertex.x - origin.x) * Math.cos(rad) - (vertex.y - origin.y) * Math.sin(rad),
            y: origin.y + (vertex.x - origin.x) * Math.sin(rad) + (vertex.y - origin.y) * Math.cos(rad),
        }
    }
}

export {
    Shape
}