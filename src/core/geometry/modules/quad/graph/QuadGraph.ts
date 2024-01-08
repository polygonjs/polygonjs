import {QuadHalfEdge} from './QuadHalfEdge';
import {QuadNode} from './QuadNode';
import {Number4} from '../../../../../types/GlobalTypes';
import {quadHalfEdgeIndices, HalfEdgeIndices, NeighbourIndex, NEIGHBOUR_INDICES} from './QuadGraphCommon';
import {addToMapAtEntry, getMapElementAtEntry} from '../../../../../core/MapUtils';
import {PrimitiveGraph} from '../../../entities/primitive/PrimitiveGraph';
import {setToArray} from '../../../../SetUtils';

const _indices: HalfEdgeIndices = {index0: 0, index1: 0};
const _neighbourIdsSet = new Set<number>();
const _neighbourIdsArray: number[] = [];

export interface NeighbourData {
	quadNode?: QuadNode | null;
	neighbourIndex: NeighbourIndex | null;
}

export class QuadGraph extends PrimitiveGraph {
	protected _quadsById: Map<number, QuadNode> = new Map();
	protected _edgesByIndex: Map<number, Map<number, QuadHalfEdge>> = new Map();
	protected _halfEdgeByHalfEdge: Map<QuadHalfEdge, QuadHalfEdge | undefined> = new Map();
	protected _halfEdgeByQuadId: Map<number, Map<number, QuadHalfEdge>> = new Map();
	protected _quadIdsByPointIndex: Map<number, Set<number>> = new Map();
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
		// add points
		for (const index of quadIndices) {
			let quadIds = this._quadIdsByPointIndex.get(index);
			if (!quadIds) {
				quadIds = new Set();
				this._quadIdsByPointIndex.set(index, quadIds);
			}
			quadIds.add(quadId);
		}

		return quadNode;
	}
	quadNode(quadId: number) {
		return this._quadsById.get(quadId);
	}
	quadIdsByPointIndex(pointIndex: number) {
		return this._quadIdsByPointIndex.get(pointIndex);
	}
	neighbourData(quadId: number, sideIndex: NeighbourIndex, target: NeighbourData): void {
		const quadNode = this._quadsById.get(quadId);
		if (!quadNode) {
			target.quadNode = null;
			target.neighbourIndex = null;
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
	// private _hasNeighbourSharingEdge(quadId: number, sideIndex: NeighbourIndex): boolean {
	// 	const quadNode = this._quadsById.get(quadId);
	// 	if (!quadNode) {
	// 		return false;
	// 	}
	// 	quadHalfEdgeIndices(quadNode.indices, sideIndex, _indices);
	// 	const halfEdge = getMapElementAtEntry(this._edgesByIndex, _indices.index0, _indices.index1)!;
	// 	return this._halfEdgeByHalfEdge.has(halfEdge);
	// }
	neighbourIdsSharingEdge(quadId: number, target: number[]): void {
		target.length = 0;

		const quadNode = this._quadsById.get(quadId);
		if (!quadNode) {
			return;
		}
		_neighbourIdsSet.clear();
		for (const i of NEIGHBOUR_INDICES) {
			quadHalfEdgeIndices(quadNode.indices, i, _indices);
			const halfEdge = getMapElementAtEntry(this._edgesByIndex, _indices.index0, _indices.index1)!;
			const oppositeHalfEdge = this._halfEdgeByHalfEdge.get(halfEdge);
			if (oppositeHalfEdge) {
				const oppositeQuadId = oppositeHalfEdge.quadId;
				_neighbourIdsSet.add(oppositeQuadId);
			}
		}
		setToArray(_neighbourIdsSet, target);
	}
	neighbourIdsSharingPoint(quadId: number, target: number[]): void {
		target.length = 0;

		const quadNode = this._quadsById.get(quadId);
		if (!quadNode) {
			return;
		}

		_neighbourIdsSet.clear();
		const indices = quadNode.indices;
		for (const index of indices) {
			const neighbourIndices = this._quadIdsByPointIndex.get(index);
			if (neighbourIndices) {
				for (const neighbourIndex of neighbourIndices) {
					if (neighbourIndex != quadId) {
						_neighbourIdsSet.add(neighbourIndex);
					}
				}
			}
		}
		setToArray(_neighbourIdsSet, target);
	}
	override neighbourIndex(quadId: number, neighbourIndex: number, withSharedEdge: boolean): number {
		if (withSharedEdge == true) {
			this.neighbourIdsSharingEdge(quadId, _neighbourIdsArray);
		} else {
			this.neighbourIdsSharingPoint(quadId, _neighbourIdsArray);
		}
		const neighbourId = _neighbourIdsArray[neighbourIndex];
		if (neighbourId != null) {
			return neighbourId;
		}
		return -1;
	}
	override neighboursCount(quadId: number, withSharedEdge: boolean): number {
		if (withSharedEdge == true) {
			this.neighbourIdsSharingEdge(quadId, _neighbourIdsArray);
		} else {
			this.neighbourIdsSharingPoint(quadId, _neighbourIdsArray);
		}
		return _neighbourIdsArray.length;
	}
}
