import {Vertex} from '.';

export type GameLevel = {
    vertices: Vertex[];
    shapes: {
        id: string,
        size: [number, number],
        x: number, y: number,
        rotation: number
    }[];
    errorIndex: number;
}