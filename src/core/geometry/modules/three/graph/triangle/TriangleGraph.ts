import {TriangleEdge} from './TriangleEdge';
import {TriangleNode} from './TriangleNode';
import {Number3} from '../../../../../../types/GlobalTypes';
import {triangleEdge, edgeId} from './TriangleGraphCommon';
import {setToArray} from '../../../../../../core/SetUtils';
import {PrimitiveGraph} from '../../../../entities/primitive/PrimitiveGraph';
import {arrayCopy} from '../../../../../ArrayUtils';

export class TriangleGraph extends PrimitiveGraph {
	private _nextTriangleId = -1;
	private _triangleIds: number[] = [];
	private _trianglesById: Map<number, TriangleNode> = new Map();
	private _edgesByTriangleId: Map<number, TriangleEdge[]> = new Map();
	private _edgesById: Map<string, TriangleEdge> = new Map();
	private _edgeIds: Set<string> = new Set();
	constructor() {
		super();
	}
	addTriangle(_triangleIndices: Number3): TriangleNode {
		const triangleIndices: Number3 = [..._triangleIndices];
		this._nextTriangleId++;
		const triangleId = this._nextTriangleId;
		const triangleNode = new TriangleNode(triangleId, triangleIndices);
		this._trianglesById.set(triangleId, triangleNode);
		this._triangleIds.push(triangleId);
		// add edges
		const edges: TriangleEdge[] = [];
		for (let i = 0; i < 3; i++) {
			const pointIdPair = triangleEdge(triangleIndices, i);
			const _edgeId = edgeId(pointIdPair);
			let edge = this._edgesById.get(_edgeId);
			if (!edge) {
				edge = new TriangleEdge(this, _edgeId, pointIdPair);
				this._edgesById.set(_edgeId, edge);
			}
			edge.addTriangle(triangleId);
			edges.push(edge);
			this._edgeIds.add(_edgeId);
		}
		this._edgesByTriangleId.set(triangleId, edges);

		return triangleNode;
	}
	removeTriangle(triangleId: number) {
		const triangleNode = this._trianglesById.get(triangleId);
		if (!triangleNode) {
			return;
		}
		this._trianglesById.delete(triangleId);
		const edges = this._edgesByTriangleId.get(triangleId);
		if (!edges) {
			return;
		}
		for (const edge of edges) {
			const index = edge.triangleIds.indexOf(triangleId);
			if (index >= 0) {
				edge.triangleIds.splice(index, 1);
			}
			if (edge.triangleIds.length == 0) {
				this._edgesById.delete(edge.id);
				this._edgeIds.delete(edge.id);
			}
		}
		this._edgesByTriangleId.delete(triangleId);
	}
	traverseTriangles(callback: (triangle: TriangleNode) => void) {
		this._trianglesById.forEach((triangle) => {
			callback(triangle);
		});
	}
	edgesByTriangleId(id: number) {
		return this._edgesByTriangleId.get(id);
	}
	// firstNeighbourId(triangleId: number): number | undefined {
	// 	const edges = this._edgesByTriangleId.get(triangleId);
	// 	if (!edges) {
	// 		return;
	// 	}
	// 	for (const edge of edges) {
	// 		for (const _triangleId of edge.triangleIds) {
	// 			if (_triangleId != triangleId) {
	// 				return _triangleId;
	// 			}
	// 		}
	// 	}
	// }
	triangleIds(target: number[]) {
		return arrayCopy(this._triangleIds, target);
	}
	triangle(triangleId: number) {
		return this._trianglesById.get(triangleId);
	}
	edgeIds(target: string[]) {
		return setToArray(this._edgeIds, target);
	}
	edge(edgeId: string) {
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
