import {Number2} from '../../../types/GlobalTypes';
export class TriangleEdge {
	public triangleIds: number[] = [];
	constructor(public readonly id: string, public readonly indices: Number2) {}
	addTriangle(triangleId: number) {
		this.triangleIds.push(triangleId);
	}
}
