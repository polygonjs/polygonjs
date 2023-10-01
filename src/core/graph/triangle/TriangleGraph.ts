import {TriangleEdge} from './TriangleEdge';
import {TriangleNode} from './TriangleNode';
import {Number3} from '../../../types/GlobalTypes';
import {triangleEdge, edgeId} from './TriangleGraphCommon';
import {setToArray} from '../../../core/SetUtils';

export class TriangleGraph {
	private _nextTriangleId = -1;
	private _trianglesById: Map<number, TriangleNode> = new Map();
	private _edgesByTriangleId: Map<number, TriangleEdge[]> = new Map();
	private _edgesById: Map<string, TriangleEdge> = new Map();
	private _edgeIds: Set<string> = new Set();
	addTriangle(triangle: Number3): TriangleNode {
		this._nextTriangleId++;
		const triangleId = this._nextTriangleId;
		const triangleNode = new TriangleNode(triangleId, triangle);
		this._trianglesById.set(triangleId, triangleNode);

		// add edges
		const edges: TriangleEdge[] = [];
		for (let i = 0; i < 3; i++) {
			const edgeIndices = triangleEdge(triangle, i);
			const _edgeId = edgeId(edgeIndices);
			let edge = this._edgesById.get(_edgeId);
			if (!edge) {
				edge = new TriangleEdge(_edgeId, edgeIndices);
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
		for (let edge of edges) {
			const index = edge.triangleIds.indexOf(triangleId);
			if (index >= 0) {
				edge.triangleIds.splice(index, 1);
			}
			this._edgesById.delete(edge.id);
			this._edgeIds.delete(edge.id);
		}
		this._edgesByTriangleId.delete(triangleId);
	}
	traverseTriangles(callback: (triangle: TriangleNode) => void) {
		this._trianglesById.forEach((triangle) => {
			callback(triangle);
		});
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
	triangle(triangleId: number) {
		return this._trianglesById.get(triangleId);
	}
	edgeIds(target: string[]) {
		return setToArray(this._edgeIds, target);
	}
	edge(edgeId: string) {
		return this._edgesById.get(edgeId);
	}
}
