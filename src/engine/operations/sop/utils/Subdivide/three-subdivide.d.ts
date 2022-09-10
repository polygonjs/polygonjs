import {BufferGeometry} from 'three';
export interface SubdivideParams {
	split?: boolean; // optional, default: true
	uvSmooth?: boolean; // optional, default: false
	preserveEdges?: boolean; // optional, default: false
	flatOnly?: boolean; // optional, default: false
	maxTriangles?: number; // optional, default: Infinity
}

export class LoopSubdivision {
	static modify: (geo: BufferGeometry, iterations: number, params: SubdivideParams) => BufferGeometry;
}
