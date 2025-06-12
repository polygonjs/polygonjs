import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {
	BufferAttribute,
	BufferGeometry,
	Object3D,
	Vector3,
	Mesh,
	Points,
	LineSegments,
	PointsMaterial,
	TypedArray,
	LineBasicMaterial,
	ColorRepresentation,
} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TriangleBasicGraph} from '../../../core/geometry/modules/three/graph/triangleBasic/TriangleBasicGraph';
import {triangleBasicGraphFromGeometry} from '../../../core/geometry/modules/three/graph/triangleBasic/TriangleBasicGraphUtils';

const _v3 = new Vector3();

class ManifoldTestSopParamsConfig extends NodeParamsConfig {
	replaceGeo = ParamConfig.BOOLEAN(false);
}
const ParamsConfig = new ManifoldTestSopParamsConfig();

export class ManifoldTestSopNode extends TypedSopNode<ManifoldTestSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'manifoldTest';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const selectedObjects = inputCoreGroup.threejsObjectsWithGeo();

		if (this.pv.replaceGeo == true) {
			const newObjects: Object3D[] = [];
			for (const object of selectedObjects) {
				const newMeshes = this._filterMesh(object as Mesh);
				if (newMeshes) {
					newObjects.push(...newMeshes);
				}
			}
			this.setObjects(newObjects);
		} else {
			for (const object of selectedObjects) {
				this._filterMesh(object as Mesh);
			}
			this.setCoreGroup(inputCoreGroup);
		}
	}

	private _filterMesh(object: Mesh): Object3D[] | void {
		const graph = triangleBasicGraphFromGeometry(object.geometry)!;

		const edgeIds: number[] = [];
		// graph.edgeIds(edgeIds);
		console.log({edgeIds: edgeIds.length});
		// const correctEdgeIds: Set<string> = new Set();
		const unsharedEdgeIds: Set<string> = new Set();
		const overusedEdgeIds: Set<string> = new Set();
		// const unsharedFaceIndicesSet: Set<number> = new Set();
		graph.forNonManifoldEdge((edge, edgeId) => {
			if (edge.triangleIds.length == 1) {
				unsharedEdgeIds.add(edgeId);
			} else if (edge.triangleIds.length > 2) {
				overusedEdgeIds.add(edgeId);
			} else {
				// correctEdgeIds.add(edgeId);
			}
		});
		// for (const edgeId of edgeIds) {
		// const edge = graph.edge(edgeId)!;
		// if (!edge) continue;
		// }
		if (unsharedEdgeIds.size > 0 || overusedEdgeIds.size > 0) {
			// const currentIndices = object.geometry.getIndex()?.array;
			const currentPositions = object.geometry.getAttribute('position')!.array;

			const objects: Object3D[] = [];
			if (unsharedEdgeIds.size > 0) {
				console.error(
					`${this.path()}: unshared edges found: ${
						unsharedEdgeIds.size
					} (total edges count:${graph.edgesCount()})`
				);

				const points = createPointsFromEdges(graph, unsharedEdgeIds, currentPositions, 0xff0000);
				const lineSegments = createLineSegmentsFromEdges(graph, unsharedEdgeIds, currentPositions, 0x0000ff);

				objects.push(points);
				objects.push(lineSegments);
			}
			if (overusedEdgeIds.size > 0) {
				console.error(
					`${this.path()}: overused edges found: ${
						overusedEdgeIds.size
					} (total edges count:${graph.edgesCount()})`
				);

				const points = createPointsFromEdges(graph, overusedEdgeIds, currentPositions, 0xff4444);
				const lineSegments = createLineSegmentsFromEdges(graph, overusedEdgeIds, currentPositions, 0x4444ff);

				objects.push(points);
				objects.push(lineSegments);
			}
			return objects;
		}
	}
}

function createPointsFromEdges(
	graph: TriangleBasicGraph,
	edgeIds: Set<string>,
	currentPositions: TypedArray,
	color: ColorRepresentation
): Points {
	const geometry = new BufferGeometry();
	const points = new Points(geometry, new PointsMaterial({color, size: 0.25}));
	const positions: number[] = [];
	const indices: number[] = [];
	let newPointsCount = 0;
	edgeIds.forEach((edgeId) => {
		const edge = graph.edgeById(edgeId)!;

		_v3.fromArray(currentPositions, edge.pointIdPair.id0 * 3);
		_v3.toArray(positions, newPointsCount * 3);
		indices.push(newPointsCount);
		newPointsCount++;

		_v3.fromArray(currentPositions, edge.pointIdPair.id1 * 3);
		_v3.toArray(positions, newPointsCount * 3);
		indices.push(newPointsCount);
		newPointsCount++;
	});
	const positionAttribute = new BufferAttribute(new Float32Array(positions), 3);
	geometry.setAttribute('position', positionAttribute);
	geometry.setIndex(indices);
	return points;
}

function createLineSegmentsFromEdges(
	graph: TriangleBasicGraph,
	edgeIds: Set<string>,
	currentPositions: TypedArray,
	color: ColorRepresentation
): LineSegments {
	const geometry = new BufferGeometry();
	const lineSegments = new LineSegments(geometry, new LineBasicMaterial({color, linewidth: 2}));

	const positions: number[] = [];
	const indices: number[] = [];
	let newPointsCount = 0;

	edgeIds.forEach((edgeId) => {
		const edge = graph.edgeById(edgeId)!;

		_v3.fromArray(currentPositions, edge.pointIdPair.id0 * 3);
		_v3.toArray(positions, newPointsCount * 3);
		indices.push(newPointsCount);
		newPointsCount++;

		_v3.fromArray(currentPositions, edge.pointIdPair.id1 * 3);
		_v3.toArray(positions, newPointsCount * 3);
		indices.push(newPointsCount);
		newPointsCount++;
	});

	const positionAttribute = new BufferAttribute(new Float32Array(positions), 3);
	geometry.setAttribute('position', positionAttribute);
	geometry.setIndex(indices);
	return lineSegments;
}
