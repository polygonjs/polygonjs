import {QuadHalfEdgeCardinality} from './QuadGraphCommon';
export interface QuadHalfEdgeOptions {
	quadId: number;
	index0: number;
	index1: number;
}

export class QuadHalfEdge {
	private _cardinality: QuadHalfEdgeCardinality | undefined;
	public readonly quadId: number;
	public readonly index0: number;
	public readonly index1: number;
	constructor(options: QuadHalfEdgeOptions) {
		this.quadId = options.quadId;
		this.index0 = options.index0;
		this.index1 = options.index1;
	}
	setCardinality(cardinality: QuadHalfEdgeCardinality) {
		this._cardinality = cardinality;
		// console.log('set cardinality', this._cardinality, this.index0, this.index1);
	}
	cardinality() {
		return this._cardinality;
	}
}
