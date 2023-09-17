import {QuadHalfEdge} from './QuadHalfEdge';
import {QuadNode} from './QuadNode';
import {Number4} from '../../../types/GlobalTypes';
import {quadHalfEdgeIndices, HalfEdgeIndices, NeighbourIndex} from './QuadGraphCommon';
import {addToMapAtEntry, getMapElementAtEntry} from '../../../core/MapUtils';

const _indices: HalfEdgeIndices = {index0: 0, index1: 0};

export interface NeighbourData {
	quadNode?: QuadNode | null;
	neighbourIndex: NeighbourIndex | null;
}

export class QuadGraph {
	private _quadsById: Map<number, QuadNode> = new Map();
	private _edgesByIndex: Map<number, Map<number, QuadHalfEdge>> = new Map();
	private _halfEdgeByHalfEdge: Map<QuadHalfEdge, QuadHalfEdge | undefined> = new Map();
	private _halfEdgeByQuadId: Map<number, Map<number, QuadHalfEdge>> = new Map();
	addQuad(quadId: number, quadIndices: Number4): QuadNode {
		const quadNode = new QuadNode(quadId, quadIndices);
		this._quadsById.set(quadId, quadNode);

		// add edges
		for (let i = 0; i < 4; i++) {
			quadHalfEdgeIndices(quadIndices, i, _indices);
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
		}

		return quadNode;
	}
	quadNode(quadId: number) {
		return this._quadsById.get(quadId);
	}
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
	}
}
