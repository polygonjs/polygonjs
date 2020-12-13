import { BufferGeometry } from 'three/src/core/BufferGeometry';
interface PolyHedronBufferGeometryParameters {
    vertices: number[];
    indices: number[];
    radius: number;
    detail: number;
}
export declare class PolyhedronBufferGeometry extends BufferGeometry {
    parameters: PolyHedronBufferGeometryParameters;
    constructor(vertices: number[], indices: number[], radius: number, detail: number, points_only: boolean);
}
export {};
