import {QuadHalfEdge} from './QuadHalfEdge';
import {QuadNode} from './QuadNode';
import {Number4} from '../../../types/GlobalTypes';
import {
	quadHalfEdgeIndices,
	// QuadHalfEdgeSide,
	// CCW_HALF_EDGE_SIDES,
	HalfEdgeIndices,
	// NeighbourSides,
	NeighbourIndex,
} from './QuadGraphCommon';
import {addToMapAtEntry, getMapElementAtEntry} from '../../../core/MapUtils';

const _indices: HalfEdgeIndices = {index0: 0, index1: 0};

export interface NeighbourData {
	quadNode?: QuadNode | null;
	neighbourIndex: NeighbourIndex | null;
}

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
			quadHalfEdgeIndices(quadIndices, i, _indices);
			// const _edgeId = edgeId(edgeIndices);
			// let edge = this._edgesById.get(_edgeId);
			// if (!edge) {
			const edge = new QuadHalfEdge({
				quadId,
				index0: _indices.index0,
				index1: _indices.index1,
				sideIndex: i as NeighbourIndex,
			});
			addToMapAtEntry(this._edgesByIndex, _indices.index0, _indices.index1, edge);
			const oppositeHalfEdge = getMapElementAtEntry(this._edgesByIndex, _indices.index1, _indices.index0);
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
	// setQuadSide(quadId: number, firstCardinal: QuadHalfEdgeSide) {
	// 	// console.log('setQuadCardinality', quadId, firstCardinal);
	// 	const quad = this._quadsById.get(quadId);
	// 	if (!quad) {
	// 		console.warn('quad not found', quadId);
	// 		return;
	// 	}
	// 	let currentIndex = CCW_HALF_EDGE_SIDES.indexOf(firstCardinal);
	// 	for (let i = 0; i < 4; i++) {
	// 		quadHalfEdgeIndices(quad.indices, i, _indices);
	// 		const halfEdge = getMapElementAtEntry(this._edgesByIndex, _indices.index0, _indices.index1);
	// 		if (halfEdge) {
	// 			const cardinality = CCW_HALF_EDGE_SIDES[currentIndex];
	// 			halfEdge.setSide(cardinality);
	// 		} else {
	// 			console.warn('half edge not found', {quadId, i, index0: _indices.index0, index1: _indices.index1});
	// 		}
	// 		currentIndex++;
	// 		if (currentIndex > 3) {
	// 			currentIndex = 0;
	// 		}
	// 	}
	// }
	// sides(quadId: number, target: NeighbourSides): void {
	// 	const neighbour0 = this.neighbour(quadId, 0);
	// 	const neighbour1 = this.neighbour(quadId, 1);
	// 	const neighbour2 = this.neighbour(quadId, 2);
	// 	const neighbour3 = this.neighbour(quadId, 3);

	// 	target[0] = neighbour0 ? this._side(neighbour0.id, quadId) || null : null;
	// 	target[1] = neighbour1 ? this._side(neighbour1.id, quadId) || null : null;
	// 	target[2] = neighbour2 ? this._side(neighbour2.id, quadId) || null : null;
	// 	target[3] = neighbour3 ? this._side(neighbour3.id, quadId) || null : null;
	// }
	// private _side(quadId0: number, quadId1: number): QuadHalfEdgeSide | undefined {
	// 	const halfEdge = getMapElementAtEntry(this._halfEdgeByQuadId, quadId0, quadId1);
	// 	// console.log('cardinality', quadId0, quadId1, halfEdge, halfEdge?.cardinality());
	// 	return halfEdge?.side();
	// }

	neighbourData(quadId: number, sideIndex: NeighbourIndex, target: NeighbourData): void {
		const quadNode = this._quadsById.get(quadId);
		if (!quadNode) {
			return;
		}
		quadHalfEdgeIndices(quadNode.indices, sideIndex, _indices);
		const halfEdge = getMapElementAtEntry(this._edgesByIndex, _indices.index0, _indices.index1)!;
		const oppositeHalfEdge = this._halfEdgeByHalfEdge.get(halfEdge);
		if (!oppositeHalfEdge) {
			target.quadNode = null;
			target.neighbourIndex = null;
			return;
		}
		const oppositeQuadId = oppositeHalfEdge.quadId;
		target.quadNode = this._quadsById.get(oppositeQuadId);
		target.neighbourIndex = oppositeHalfEdge.sideIndex;
		// return oppositeQuadNode;

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
