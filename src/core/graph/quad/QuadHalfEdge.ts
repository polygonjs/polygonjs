import {NeighbourIndex} from './QuadGraphCommon';
export interface QuadHalfEdgeOptions {
	quadId: number;
	index0: number;
	index1: number;
	sideIndex: NeighbourIndex;
}

export class QuadHalfEdge {
	// private _side: QuadHalfEdgeSide | undefined;
	public readonly quadId: number;
	public readonly index0: number;
	public readonly index1: number;
	public readonly sideIndex: NeighbourIndex;
	constructor(options: QuadHalfEdgeOptions) {
		this.quadId = options.quadId;
		this.index0 = options.index0;
		this.index1 = options.index1;
		this.sideIndex = options.sideIndex;
	}
	// setSide(side: QuadHalfEdgeSide) {
	// 	this._side = side;
	// 	// console.log('set cardinality', this._cardinality, this.index0, this.index1);
	// }
	// side() {
	// 	return this._side;
	// }
}
