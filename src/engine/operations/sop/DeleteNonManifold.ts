import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Mesh} from 'three';
import {triangleGraphFromGeometry} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraphUtils';
import {setToArray} from '../../../core/SetUtils';
import {ThreejsPrimitiveTriangle} from '../../../core/geometry/modules/three/ThreejsPrimitiveTriangle';
import {arrayCopy, arrayDifference} from '../../../core/ArrayUtils';
import {TriangleGraph} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraph';
interface DeleteNonManifoldSopParams extends DefaultOperationParams {
	group: string;
	invert: boolean;
}
export class DeleteNonManifoldSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: DeleteNonManifoldSopParams = {
		group: '',
		invert: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.DELETE_NON_MANIFOLD> {
		return SopType.DELETE_NON_MANIFOLD;
	}

	override cook(inputCoreGroups: CoreGroup[], params: DeleteNonManifoldSopParams) {
		const coreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterObjects(coreGroup, params);
		for (const inputObject of selectedObjects) {
			const mesh = inputObject as Mesh;
			if (mesh.geometry != null && mesh.geometry.index != null) {
				this._deleteNonManifold(mesh, params.invert);
			}
		}
		coreGroup.resetBoundingBox();
		return coreGroup;
	}
	private _deleteNonManifold(mesh: Mesh, invert: boolean) {
		const graph = triangleGraphFromGeometry(mesh.geometry);
		if (!graph) {
			return;
		}
		const edgeIds: string[] = [];
		graph.edgeIds(edgeIds);
		const edgesCount = edgeIds.length;
		const nonManifoldTriangleIdsSet: Set<number> = new Set();

		// get edges shared with more than 2 triangles, or less than 2 triangles
		const nonManifoldEdgeIdsSet: Set<string> = new Set();
		for (let i = 0; i < edgesCount; i++) {
			const edgeId = edgeIds[i];
			const edge = graph.edge(edgeId);
			if (edge) {
				if (edge.triangleIds.length == 1) {
					// if the edge is shared with just 1 triangle, it is definitely non manifold
					nonManifoldTriangleIdsSet.add(edge.triangleIds[0]);
				} else if (edge.triangleIds.length > 2) {
					nonManifoldEdgeIdsSet.add(edgeId);
				}
			}
		}

		// get the triangle for those edges
		const nonManifoldEdgeIds: string[] = [];
		const potentiallyNonManifoldTriangleIdsSet: Set<number> = new Set();
		setToArray(nonManifoldEdgeIdsSet, nonManifoldEdgeIds);
		const nonManifoldEdgesCount = nonManifoldEdgeIds.length;
		for (let i = 0; i < nonManifoldEdgesCount; i++) {
			const edgeId = nonManifoldEdgeIds[i];
			const edge = graph.edge(edgeId);
			if (edge) {
				for (const triangleId of edge.triangleIds) {
					potentiallyNonManifoldTriangleIdsSet.add(triangleId);
				}
			}
		}

		// find triangles whose neighbours are either in the non manifold set, or not shared with any triangle
		this._resolvePpotentiallyNonManifoldTriangleIds(
			graph,
			potentiallyNonManifoldTriangleIdsSet,
			nonManifoldTriangleIdsSet
		);
		//
		this._cleanMesh(mesh, graph, nonManifoldTriangleIdsSet, invert);
	}
	private _resolvePpotentiallyNonManifoldTriangleIds(
		graph: TriangleGraph,
		potentiallyNonManifoldTriangleIdsSet: Set<number>,
		nonManifoldTriangleIdsSet: Set<number>
	) {
		potentiallyNonManifoldTriangleIdsSet.forEach((triangleId) => {
			const edges = graph.edgesByTriangleId(triangleId);
			if (edges) {
				for (const edge of edges) {
					for (const _triangleId of edge.triangleIds) {
						if (_triangleId != triangleId) {
							if (
								nonManifoldTriangleIdsSet.has(_triangleId) == false &&
								potentiallyNonManifoldTriangleIdsSet.has(_triangleId) == false
							) {
								return;
							}
						}
					}
				}
			}
			nonManifoldTriangleIdsSet.add(triangleId);
		});
	}
	private _cleanMesh(mesh: Mesh, graph: TriangleGraph, nonManifoldTriangleIdsSet: Set<number>, invert: boolean) {
		if (nonManifoldTriangleIdsSet.size == 0) {
			return;
		}
		const allTriangleIdsSet: Set<number> = new Set();
		graph.traverseTriangles((triangle) => {
			allTriangleIdsSet.add(triangle.id);
		});
		const nonManifoldTriangleIds: number[] = [];
		const allTriangleIds: number[] = [];
		setToArray(nonManifoldTriangleIdsSet, nonManifoldTriangleIds);
		setToArray(allTriangleIdsSet, allTriangleIds);
		const triangleIdsToRemove: number[] = [];
		if (invert == true) {
			arrayCopy(nonManifoldTriangleIds, triangleIdsToRemove);
		} else {
			arrayDifference(allTriangleIds, nonManifoldTriangleIds, triangleIdsToRemove);
		}
		//
		const triangles = triangleIdsToRemove.map((triangleId) => new ThreejsPrimitiveTriangle(mesh, triangleId));
		if (triangles.length > 0) {
			const firstTriangle = triangles[0];
			const builder = firstTriangle.builder();
			const newObject = builder(mesh, triangles) as Mesh;
			if (newObject) {
				mesh.geometry = newObject.geometry;
			}
		}
	}
}
