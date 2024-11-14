import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Mesh} from 'three';
import {triangleGraphFromGeometry} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraphUtils';
import {ThreejsPrimitiveTriangle} from '../../../core/geometry/modules/three/ThreejsPrimitiveTriangle';
import {TriangleGraph} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraph';
import {threeMeshFromPrimitives} from '../../../core/geometry/modules/three/builders/Mesh';
import {setToArray} from '../../../core/SetUtils';
import {arrayDifference} from '../../../core/ArrayUtils';
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
		const triangleIds: number[] = [];
		graph.edgeIds(edgeIds);
		graph.triangleIds(triangleIds);
		const sortedTriangleIds = sortTriangleIdsByScore(graph, triangleIds);

		const selectedTriangleIds: Set<number> = new Set();
		let status = manifoldStatus(graph, triangleIds, selectedTriangleIds);
		if (status.nonManifoldEdges > 0) {
			for (const triangleId of sortedTriangleIds) {
				selectedTriangleIds.add(triangleId);
				status = manifoldStatus(graph, triangleIds, selectedTriangleIds);
				if (status.nonManifoldEdges == 0) {
					break;
				}
			}
		}
		if (invert) {
			const triangleIdsToRemove: number[] = [];
			setToArray(selectedTriangleIds, triangleIdsToRemove);
			this._cleanMesh(mesh, triangleIdsToRemove);
		} else {
			const selectedTriangleIdsArray: number[] = [];
			setToArray(selectedTriangleIds, selectedTriangleIdsArray);
			const triangleIdsToRemove: number[] = [];
			arrayDifference(triangleIds, selectedTriangleIdsArray, triangleIdsToRemove);
			this._cleanMesh(mesh, triangleIdsToRemove);
		}
	}

	private _cleanMesh(mesh: Mesh, triangleIdsToKeep: number[]) {
		const triangles = triangleIdsToKeep.map((triangleId) => new ThreejsPrimitiveTriangle(mesh, triangleId));
		if (triangles.length > 0) {
			const newObject = threeMeshFromPrimitives(mesh, triangles) as Mesh;
			if (newObject) {
				mesh.geometry = newObject.geometry;
			}
		} else {
			const newObject = threeMeshFromPrimitives(mesh, []) as Mesh;
			if (newObject) {
				mesh.geometry = newObject.geometry;
			}
		}
	}
}

function sortTriangleIdsByScore(graph: TriangleGraph, triangleIds: number[]): number[] {
	const scoreByTriangleId: number[] = [];
	for (const triangleId of triangleIds) {
		scoreByTriangleId.push(triangleScore(graph, triangleId));
	}
	const sortedTriangleIds = triangleIds.slice();
	sortedTriangleIds.sort((a, b) => scoreByTriangleId[b] - scoreByTriangleId[a]);
	return sortedTriangleIds;
}

function triangleScore(graph: TriangleGraph, triangleId: number) {
	const edges = graph.edgesByTriangleId(triangleId);
	let potentialNonManifoldEdges = 0;
	let totalEdges = 0;
	if (edges) {
		for (const edge of edges) {
			if (edge.triangleIds.length != 2) {
				potentialNonManifoldEdges++;
			}
			totalEdges += edge.triangleIds.length;
		}
	}
	totalEdges /= 3;
	return potentialNonManifoldEdges * 10 + (totalEdges - 2);
}

interface ManifoldStatus {
	nonManifoldEdges: number;
	activeEdges: Map<string, number>;
}
function manifoldStatus(graph: TriangleGraph, triangleIds: number[], triangleIdsToRemove: Set<number>): ManifoldStatus {
	let nonManifoldEdges = 0;
	const activeEdges: Map<string, number> = new Map();

	// Recalculate edge counts excluding removed faces
	triangleIds.forEach((triangleId) => {
		if (triangleIdsToRemove.has(triangleId)) return;

		const edges = graph.edgesByTriangleId(triangleId);
		if (edges) {
			edges.forEach((edge) => {
				if (!activeEdges.has(edge.id)) {
					activeEdges.set(edge.id, 0);
				}
				activeEdges.set(edge.id, activeEdges.get(edge.id)! + 1);
			});
		}
	});

	// Count non-manifold edges
	activeEdges.forEach((count, edge) => {
		if (count !== 2) {
			nonManifoldEdges++;
		}
	});

	return {
		nonManifoldEdges,
		activeEdges,
	};
}
