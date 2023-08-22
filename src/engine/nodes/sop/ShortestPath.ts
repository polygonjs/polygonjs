/**
 * Creates a line representing the shortest path between two points.
 *
 *
 */
import {Vector3, Mesh, Object3D, BufferGeometry, Float32BufferAttribute} from 'three';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Node, Edge, Graph, AStar, HeuristicPolicy} from '../../../core/thirdParty/yuka/yuka';
import {Attribute} from '../../../core/geometry/Attribute';
import {Number2} from '../../../types/GlobalTypes';
import {ObjectType} from '../../../core/geometry/Constant';
const _v0 = new Vector3();
const _v1 = new Vector3();
const EDGES: [Number2, Number2, Number2] = [
	[0, 1],
	[1, 2],
	[2, 0],
];
function getDist(graph: Graph, source: number, target: number) {
	const sourceNode = graph.getNode(source) as PositionNode | undefined;
	const targetNode = graph.getNode(target) as PositionNode | undefined;
	if (!(sourceNode && targetNode)) {
		return 0;
	}
	sourceNode.position(_v0);
	targetNode.position(_v1);

	return _v0.distanceToSquared(_v1);
}
const heuristicPolicy: HeuristicPolicy = {
	calculate: getDist,
};

class PositionNode extends Node {
	constructor(public readonly index: number, public readonly positionArray: ArrayLike<number>) {
		super(index);
	}
	position(target: Vector3) {
		return target.fromArray(this.positionArray, this.index * 3);
	}
}

class ShortestPathSopParamsConfig extends NodeParamsConfig {
	/** @param objects to find paths in */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param index of start point */
	pt0 = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param index of end point */
	pt1 = ParamConfig.INTEGER(1, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new ShortestPathSopParamsConfig();

export class ShortestPathSopNode extends TypedSopNode<ShortestPathSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SHORTEST_PATH;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterThreejsObjects(inputCoreGroup, this.pv);

		const newObjects: Object3D[] = [];
		for (let object of selectedObjects) {
			this._createShortestPath(object, newObjects);
		}
		this.setObjects(newObjects);
	}
	private _createShortestPath(object: Object3D, newObjects: Object3D[]) {
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		const index = geometry.getIndex();
		if (!(positionAttribute && index)) {
			return;
		}
		const pointsCount = positionAttribute.count;
		const facesCount = index.count / 3;
		const positions = positionAttribute.array;
		const indices = index.array;
		const endPtBySrcPt: Map<number, Set<number>> = new Map();

		const graph = new Graph();
		for (let i = 0; i < pointsCount; i++) {
			const node = new PositionNode(i, positions);
			graph.addNode(node);
		}
		for (let i = 0; i < facesCount; i++) {
			for (let edgeIndices of EDGES) {
				const i0 = indices[i * 3 + edgeIndices[0]];
				const i1 = indices[i * 3 + edgeIndices[1]];
				let endPts0 = endPtBySrcPt.get(i0);
				let endPts1 = endPtBySrcPt.get(i1);
				if (!endPts0) {
					endPts0 = new Set();
					endPtBySrcPt.set(i0, endPts0);
				}
				if (!endPts1) {
					endPts1 = new Set();
					endPtBySrcPt.set(i1, endPts1);
				}
				if (!endPts0.has(i1)) {
					const edge = new Edge(i0, i1, 0);
					graph.addEdge(edge);
					endPts0.add(i1);
					endPts1.add(i0);
				}
			}
		}

		const solver = new AStar(graph, this.pv.pt0, this.pv.pt1);
		solver.heuristic = heuristicPolicy;
		solver.search();
		const path = solver.getPath();
		this._buildLine(path, graph, newObjects);
	}
	private _buildLine(path: number[], graph: Graph, newObjects: Object3D[]) {
		const pointsCount = path.length;
		const positions: number[] = new Array(pointsCount * 3);
		const indices: number[] = new Array(pointsCount);

		for (let i = 0; i < pointsCount; i++) {
			const node = graph.getNode(path[i]) as PositionNode;
			node.position(_v0).toArray(positions, i * 3);

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		const object = this.createObject(geometry, ObjectType.LINE_SEGMENTS);
		newObjects.push(object);
	}
}
