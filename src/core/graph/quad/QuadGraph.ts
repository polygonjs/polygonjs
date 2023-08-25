import {QuadHalfEdge} from './QuadHalfEdge';
import {QuadNode} from './QuadNode';
import {Number4} from '../../../types/GlobalTypes';
import {quadHalfEdgeIndices, QuadHalfEdgeCardinality, CCW_HALF_EDGE_CARDINALITIES} from './QuadGraphCommon';
import {addToMapAtEntry, getMapElementAtEntry} from '../../../core/MapUtils';

export class QuadGraph {
	private _quadsById: Map<number, QuadNode> = new Map();
	// private _edgesByQuadId: Map<number, QuadHalfEdge[]> = new Map();
	private _edgesByIndex: Map<number, Map<number, QuadHalfEdge>> = new Map();
	private _halfEdgeByHalfEdge: Map<QuadHalfEdge, QuadHalfEdge | undefined> = new Map();
	private _halfEdgeByQuadId: Map<number, Map<number, QuadHalfEdge>> = new Map();
	// private _edgeIds: Set<string> = new Set();
	addQuad(quadId: number, quadIndices: Number4): QuadNode {
		const quadNode = new QuadNode(quadId, quadIndices);
		this._quadsById.set(quadId, quadNode);

		// add edges
		// const edges: QuadEdge[] = [];
		for (let i = 0; i < 4; i++) {
			const [index0, index1] = quadHalfEdgeIndices(quadIndices, i);
			// const _edgeId = edgeId(edgeIndices);
			// let edge = this._edgesById.get(_edgeId);
			// if (!edge) {
			const edge = new QuadHalfEdge({
				quadId,
				index0,
				index1,
			});
			addToMapAtEntry(this._edgesByIndex, index0, index1, edge);
			const oppositeHalfEdge = getMapElementAtEntry(this._edgesByIndex, index1, index0);
			if (oppositeHalfEdge) {
				this._halfEdgeByHalfEdge.set(edge, oppositeHalfEdge);
				this._halfEdgeByHalfEdge.set(oppositeHalfEdge, edge);
				addToMapAtEntry(this._halfEdgeByQuadId, quadNode.id, oppositeHalfEdge.quadId, edge);
				addToMapAtEntry(this._halfEdgeByQuadId, oppositeHalfEdge.quadId, quadNode.id, oppositeHalfEdge);
			}
			// this._edgesById.set(_edgeId, edge);
			// }
			// edge.addQuad(index);
			// edges.push(edge);
			// this._edgeIds.add(_edgeId);
		}
		// this._edgesByQuadId.set(index, edges);

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
	// traverseQuad(callback: (quad: QuadNode) => void) {
	// 	this._quadsById.forEach((quad) => {
	// 		callback(quad);
	// 	});
	// }
	setQuadCardinality(quadId: number, firstCardinal: QuadHalfEdgeCardinality) {
		// console.log('setQuadCardinality', quadId, firstCardinal);
		const quad = this._quadsById.get(quadId);
		if (!quad) {
			console.warn('quad not found', quadId);
			return;
		}
		let currentIndex = CCW_HALF_EDGE_CARDINALITIES.indexOf(firstCardinal);
		for (let i = 0; i < 4; i++) {
			const [index0, index1] = quadHalfEdgeIndices(quad.indices, i);
			const halfEdge = getMapElementAtEntry(this._edgesByIndex, index0, index1);
			if (halfEdge) {
				const cardinality = CCW_HALF_EDGE_CARDINALITIES[currentIndex];
				halfEdge.setCardinality(cardinality);
			} else {
				console.warn('half edge not found', {quadId, i, index0, index1});
			}
			currentIndex++;
			if (currentIndex > 3) {
				currentIndex = 0;
			}
		}
	}
	cardinality(quadId0: number, quadId1: number): QuadHalfEdgeCardinality | undefined {
		const halfEdge = getMapElementAtEntry(this._halfEdgeByQuadId, quadId0, quadId1);
		// console.log('cardinality', quadId0, quadId1, halfEdge, halfEdge?.cardinality());
		return halfEdge?.cardinality();
	}

	neighbour(quadId: number, sideIndex: number): QuadNode | undefined {
		const quadNode = this._quadsById.get(quadId);
		if (!quadNode) {
			return;
		}
		// TODO optimize
		const [index0, index1] = quadHalfEdgeIndices(quadNode.indices, sideIndex);
		const halfEdge = getMapElementAtEntry(this._edgesByIndex, index0, index1)!;
		const oppositeHalfEdge = this._halfEdgeByHalfEdge.get(halfEdge);
		if (!oppositeHalfEdge) {
			return;
		}
		const oppositeQuadId = oppositeHalfEdge.quadId;
		const oppositeQuadNode = this._quadsById.get(oppositeQuadId);
		return oppositeQuadNode;

		// const edges = this._edgesByQuadId.get(quadId);
		// if (!edges) {
		// 	return;
		// }
		// const edge = edges[sideIndex];
		// return edge.quadIds[0] == quadId ? this.quad(edge.quadIds[1]) : this.quad(edge.quadIds[0]);
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
	// quad(quadId: number) {
	// 	return this._quadsById.get(quadId);
	// }
	// edgeIds() {
	// 	return setToArray(this._edgeIds);
	// }
	// edge(edgeId: string) {
	// 	return this._edgesById.get(edgeId);
	// }
}
