import {PointIdPair} from './TriangleGraphCommon';
export class TriangleEdge {
	public triangleIds: number[] = [];
	constructor(public readonly id: string, public readonly pointIdPair: PointIdPair) {}
	addTriangle(triangleId: number) {
		this.triangleIds.push(triangleId);
	}
}
