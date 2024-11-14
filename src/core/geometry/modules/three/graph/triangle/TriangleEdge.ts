import {TypedArray, Vector3} from 'three';
import {PointIdPair} from './TriangleGraphCommon';
import {TriangleGraph} from './TriangleGraph';

const _p0 = new Vector3();
const _p1 = new Vector3();

export class TriangleEdge {
	public triangleIds: number[] = [];
	constructor(
		public readonly graph: TriangleGraph,
		public readonly id: string,
		public readonly pointIdPair: PointIdPair
	) {}
	addTriangle(triangleId: number) {
		this.triangleIds.push(triangleId);
	}
}
export function triangleEdgeLength(edge: TriangleEdge, positions: TypedArray): number {
	_p0.fromArray(positions, edge.pointIdPair.id0 * 3);
	_p1.fromArray(positions, edge.pointIdPair.id1 * 3);
	return _p0.distanceTo(_p1);
}

export function triangleEdgePositions(edge: TriangleEdge, position: number[], pt0: Vector3, pt1: Vector3) {
	pt0.fromArray(position, edge.pointIdPair.id0 * 3);
	pt1.fromArray(position, edge.pointIdPair.id1 * 3);
}
