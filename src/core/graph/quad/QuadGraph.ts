import {QuadEdge} from './QuadEdge';
import {QuadNode} from './QuadNode';
import {Number4} from '../../../types/GlobalTypes';
import {quadEdge, edgeId} from './QuadGraphCommon';
import {setToArray} from '../../../core/SetUtils';

export class QuadGraph {
	private _quadsById: Map<number, QuadNode> = new Map();
	private _edgesByQuadId: Map<number, QuadEdge[]> = new Map();
	private _edgesById: Map<string, QuadEdge> = new Map();
	private _edgeIds: Set<string> = new Set();
	addQuad(index: number, quad: Number4): QuadNode {
		const quadNode = new QuadNode(index, quad);
		this._quadsById.set(index, quadNode);

		// add edges
		const edges: QuadEdge[] = [];
		for (let i = 0; i < 3; i++) {
			const edgeIndices = quadEdge(quad, i);
			const _edgeId = edgeId(edgeIndices);
			let edge = this._edgesById.get(_edgeId);
			if (!edge) {
				edge = new QuadEdge(_edgeId, edgeIndices);
				this._edgesById.set(_edgeId, edge);
			}
			edge.addQuad(index);
			edges.push(edge);
			this._edgeIds.add(_edgeId);
		}
		this._edgesByQuadId.set(index, edges);

		return quadNode;
	}
	// removeQuad(quadId: number) {
	// 	const QuadNode = this._quadsById.get(quadId);
	// 	if (!QuadNode) {
	// 		return;
	// 	}
	// 	this._quadsById.delete(quadId);
	// 	const edges = this._edgesByQuadId.get(quadId);
	// 	if (!edges) {
	// 		return;
	// 	}
	// 	for (let edge of edges) {
	// 		const index = edge.quadIds.indexOf(quadId);
	// 		if (index >= 0) {
	// 			edge.quadIds.splice(index, 1);
	// 		}
	// 		this._edgesById.delete(edge.id);
	// 		this._edgeIds.delete(edge.id);
	// 	}
	// 	this._edgesByQuadId.delete(quadId);
	// }
	traverseQuad(callback: (quad: QuadNode) => void) {
		this._quadsById.forEach((quad) => {
			callback(quad);
		});
	}
	// firstNeighbourId(quadId: number): number | undefined {
	// 	const edges = this._edgesByQuadId.get(quadId);
	// 	if (!edges) {
	// 		return;
	// 	}
	// 	for (const edge of edges) {
	// 		for (const _quadId of edge.quadIds) {
	// 			if (_quadId != quadId) {
	// 				return _quadId;
	// 			}
	// 		}
	// 	}
	// }
	quad(quadId: number) {
		return this._quadsById.get(quadId);
	}
	edgeIds() {
		return setToArray(this._edgeIds);
	}
	edge(edgeId: string) {
		return this._edgesById.get(edgeId);
	}
}
