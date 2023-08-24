import {Number2} from '../../../types/GlobalTypes';
export class QuadEdge {
	public quadIds: number[] = [];
	constructor(public readonly id: string, public readonly indices: Number2) {}
	addQuad(triangleId: number) {
		this.quadIds.push(triangleId);
	}
}
