import {TriangleBasicEdge, triangleEdgeCreate, triangleEdgeAddTriangle} from './TriangleBasicEdge';
import {Number3} from '../../../../../../types/GlobalTypes';
import {triangleBasicEdge} from './TriangleBasicGraphCommon';
import {PrimitiveGraph} from '../../../../entities/primitive/PrimitiveGraph';
import {edgeId} from '../triangle/TriangleGraphCommon';

export class TriangleBasicGraph extends PrimitiveGraph {
	private _edgesById: Map<string, TriangleBasicEdge> = new Map();
	private _edgesIdByIndex: string[] = [];
	private _edgeIndex = 0;
	constructor() {
		super();
	}

	setTriangle(id: number, _triangleIndices: Number3) {
		const triangleIndices: Number3 = [..._triangleIndices];
		const triangleId = id;

		for (let i = 0; i < 3; i++) {
			const pointIdPair = triangleBasicEdge(triangleIndices, i);
			const _edgeId = edgeId(pointIdPair);
			let edge = this._edgesById.get(_edgeId);
			if (!edge) {
				edge = triangleEdgeCreate(this, triangleId, this._edgeIndex, pointIdPair);
				this._edgesById.set(_edgeId, edge);
				this._edgesIdByIndex[this._edgeIndex] = _edgeId;
				this._edgeIndex++;
			} else {
				triangleEdgeAddTriangle(edge, triangleId);
			}
		}
	}

	forNonManifoldEdge(callback: (edge: TriangleBasicEdge, edgeId: string) => void) {
		const edgesCount = this._edgesIdByIndex.length;
		for (let i = 0; i < edgesCount; i++) {
			const edgeId = this._edgesIdByIndex[i];
			const edge = this._edgesById.get(edgeId)!;
			// if (!edge) continue;
			if (edge.triangleIds.length != 2) {
				callback(edge, edgeId);
				// unsharedPointIndicesSet.add(edge.pointIdPair.id0);
				// unsharedPointIndicesSet.add(edge.pointIdPair.id1);
				// unsharedFaceIndicesSet.add(edge.triangleIds[0]);
			}
		}
	}
	edgesCount() {
		return this._edgesIdByIndex.length;
	}
	edgeById(edgeId: string) {
		return this._edgesById.get(edgeId);
	}

	override neighbourIndex(primitiveIndex: number, neighbourIndex: number, withSharedEdge: boolean): number {
		console.warn('not implemented');
		return 0;
	}
	override neighboursCount(primitiveIndex: number, withSharedEdge: boolean): number {
		console.warn('not implemented');
		return 0;
	}
}
