/**
 * Creates a quad plane.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/quad/QuadGeometry';
import {Vector3, BufferGeometry, Mesh} from 'three';
import {QuadPointAttribute} from '../../../core/geometry/quad/QuadPointAttribute';
import {Attribute} from '../../../core/geometry/Attribute';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {QuadObject} from '../../../core/geometry/quad/QuadObject';
import {Number2, Number3} from '../../../types/GlobalTypes';
import {setToArray} from '../../../core/SetUtils';
import {sample} from '../../../core/ArrayUtils';

const _v3 = new Vector3();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();
const EDGES: [Number2, Number2, Number2] = [
	[0, 1],
	[1, 2],
	[2, 0],
];
function sortNumber2(n: Number2): Number2 {
	return n[0] < n[1] ? n : [n[1], n[0]];
}
function _edgeId(edge: Number2): string {
	return sortNumber2(edge).join('-');
}
function triangleEdge(triangle: Number3, edgeIndex: number): Number2 {
	const edgeIndices = EDGES[edgeIndex];
	const edge: Number2 = [triangle[edgeIndices[0]], triangle[edgeIndices[1]]];
	return edge;
}

class TriangleNode {
	constructor(public readonly id: number, public readonly triangle: Number3) {}
}
class TriangleGraph {
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
			const edgeId = _edgeId(edgeIndices);
			let edge = this._edgesById.get(edgeId);
			if (!edge) {
				edge = new TriangleEdge(edgeId, edgeIndices);
				this._edgesById.set(edgeId, edge);
			}
			edge.addTriangle(triangleId);
			edges.push(edge);
			this._edgeIds.add(edgeId);
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
	traverseTriangle(callback: (triangle: TriangleNode) => void) {
		this._trianglesById.forEach((triangle) => {
			callback(triangle);
		});
	}
	firstNeighbourId(triangleId: number): number | undefined {
		const edges = this._edgesByTriangleId.get(triangleId);
		if (!edges) {
			return;
		}
		for (let edge of edges) {
			for (let triangleId of edge.triangleIds) {
				if (triangleId != triangleId) {
					return triangleId;
				}
			}
		}
	}
	triangle(triangleId: number) {
		return this._trianglesById.get(triangleId);
	}
	edgeIds() {
		return setToArray(this._edgeIds);
	}
	edge(edgeId: string) {
		return this._edgesById.get(edgeId);
	}
}
class TriangleEdge {
	public triangleIds: number[] = [];
	constructor(public readonly id: string, public readonly indices: Number2) {}
	addTriangle(triangleId: number) {
		this.triangleIds.push(triangleId);
	}
}

class QuadrangulateSopParamsConfig extends NodeParamsConfig {
	/** @param quadsCount */
	quadsCount = ParamConfig.INTEGER(1, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
	/** @param regular */
	regular = ParamConfig.BOOLEAN(1);
	/** @param seed */
	seed = ParamConfig.INTEGER(0, {
		range: [-100, 100],
		rangeLocked: [false, false],
		visibleIf: {
			regular: 0,
		},
	});
}
const ParamsConfig = new QuadrangulateSopParamsConfig();

export class QuadrangulateSopNode extends QuadSopNode<QuadrangulateSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUADRANGULATE;
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const threejsObjects = coreGroup.threejsObjects();

		const newQuadObjects: QuadObject[] = [];
		// build triangle graph
		for (const object of threejsObjects) {
			const geometry = (object as Mesh).geometry;
			if (geometry) {
				const newQuadObject = this._processGeometry(geometry);
				if (newQuadObject) {
					newQuadObjects.push(newQuadObject);
				}
			}
		}
		this.setQuadObjects(newQuadObjects);
	}

	private _processGeometry(geometry: BufferGeometry): QuadObject | undefined {
		const index = geometry.getIndex();
		if (!index) {
			return;
		}
		const polygonsCount = index.array.length / 3;
		if (polygonsCount < 2) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttribute) {
			return;
		}
		const expectedQuadsCount = this.pv.quadsCount;
		const regular = this.pv.regular;
		const seed = this.pv.seed;

		const quadGeometry = new QuadGeometry();
		const newPositionArray = [...(positionAttribute.array as number[])];
		const position = new QuadPointAttribute(newPositionArray, 3);
		quadGeometry.addPointAttribute(Attribute.POSITION, position);
		const quadIndices: number[] = [];

		const graph = new TriangleGraph();
		for (let i = 0; i < polygonsCount; i++) {
			_v3.fromArray(index.array, i * 3);
			graph.addTriangle(_v3.toArray() as Number3);
		}

		const edgeCenterIndexByEdgeIndices: Map<number, Map<number, number>> = new Map();
		const _findOrCreateEdgeCenterIndex = (i0: number, i1: number) => {
			const key0 = i0 < i1 ? i0 : i1;
			const key1 = i0 < i1 ? i1 : i0;
			let edgeCenterIndexByEdgeIndex = edgeCenterIndexByEdgeIndices.get(key0);
			if (!edgeCenterIndexByEdgeIndex) {
				edgeCenterIndexByEdgeIndex = new Map();
				edgeCenterIndexByEdgeIndices.set(key0, edgeCenterIndexByEdgeIndex);
			}
			let edgeCenterIndex = edgeCenterIndexByEdgeIndex.get(key1);
			if (edgeCenterIndex == null) {
				_p0.fromArray(newPositionArray, i0 * 3);
				_p1.fromArray(newPositionArray, i1 * 3);
				// add edge
				_v3.copy(_p0).add(_p1).multiplyScalar(0.5);
				edgeCenterIndex = newPositionArray.length / 3;
				_v3.toArray(newPositionArray, newPositionArray.length);

				edgeCenterIndexByEdgeIndex.set(key1, edgeCenterIndex);
			}
			return edgeCenterIndex;
		};

		let quadsCount = 0;
		const _completeQuadObject = () => {
			// if non regular, we also need to add the remaining triangles
			if (!regular) {
				graph.traverseTriangle((triangle) => {
					// quadIndices.push(...triangle.triangle);
					const i0 = triangle.triangle[0];
					const i1 = triangle.triangle[1];
					const i2 = triangle.triangle[2];
					_p0.fromArray(newPositionArray, i0 * 3);
					_p1.fromArray(newPositionArray, i1 * 3);
					_p2.fromArray(newPositionArray, i2 * 3);

					// add center
					_v3.copy(_p0).add(_p1).add(_p2).divideScalar(3);
					const iCenter = newPositionArray.length / 3;
					_v3.toArray(newPositionArray, newPositionArray.length);
					// add edge centers
					const i01 = _findOrCreateEdgeCenterIndex(i0, i1);
					const i12 = _findOrCreateEdgeCenterIndex(i1, i2);
					const i20 = _findOrCreateEdgeCenterIndex(i2, i0);
					// add edge 0-1
					// _v3.copy(_p0).add(_p1).multiplyScalar(0.5);
					// const i01 = newPositionArray.length / 3;
					// _v3.toArray(newPositionArray, newPositionArray.length);
					// add edge 1-2
					// _v3.copy(_p1).add(_p2).multiplyScalar(0.5);
					// const i12 = newPositionArray.length / 3;
					// _v3.toArray(newPositionArray, newPositionArray.length);
					// add edge 2-0
					// _v3.copy(_p2).add(_p0).multiplyScalar(0.5);
					// const i20 = newPositionArray.length / 3;
					// _v3.toArray(newPositionArray, newPositionArray.length);

					// add 3 quads
					quadIndices.push(i0, i01, iCenter, i20);
					quadIndices.push(i1, i12, iCenter, i01);
					quadIndices.push(i2, i20, iCenter, i12);
				});
			}

			quadGeometry.setIndex(quadIndices);
			const quadObject = new QuadObject(quadGeometry);
			return quadObject;
		};

		const _nextEdgeIdWithRegularMethod = () => {
			return edgeIds.pop();
		};
		const _nextEdgeidWithIrregularMethod = (i: number) => {
			const edgeId = sample(edgeIds, seed + i);
			if (edgeId != null) {
				const index = edgeIds.indexOf(edgeId);
				edgeIds.splice(index, 1);
			}
			return edgeId;
		};

		const edgeIds = graph.edgeIds();
		let i = 0;
		while (edgeIds.length > 0 && quadsCount < expectedQuadsCount) {
			i++;
			const edgeId = regular ? _nextEdgeIdWithRegularMethod() : _nextEdgeidWithIrregularMethod(i);
			if (edgeId == null) {
				return _completeQuadObject();
			}

			const edge = graph.edge(edgeId);
			if (!edge) {
				continue;
			}
			const triangleIds = edge.triangleIds;
			const triangle0 = graph.triangle(triangleIds[0]);
			const triangle1 = graph.triangle(triangleIds[1]);
			if (!triangle0 || !triangle1) {
				continue;
			}
			graph.removeTriangle(triangle0.id);
			graph.removeTriangle(triangle1.id);
			// create quad
			const i0 = triangle0.triangle.find((index) => index != edge.indices[0] && index != edge.indices[1])!;
			const i2 = triangle1.triangle.find((index) => index != edge.indices[0] && index != edge.indices[1])!;
			const triangle0UnsharedIndexIndex = triangle0.triangle.indexOf(i0);
			const triangle1UnsharedIndexIndex = triangle1.triangle.indexOf(i2);
			const i1 = triangle0.triangle[(triangle0UnsharedIndexIndex + 1) % 3];
			const i3 = triangle1.triangle[(triangle1UnsharedIndexIndex + 1) % 3];
			if (regular) {
				quadIndices.push(i0, i1, i2, i3);
				quadsCount++;
			} else {
				// get center and add to position
				_p0.fromArray(newPositionArray, i0 * 3);
				_p1.fromArray(newPositionArray, i1 * 3);
				_p2.fromArray(newPositionArray, i2 * 3);
				_p3.fromArray(newPositionArray, i3 * 3);
				// add center
				_v3.copy(_p0).add(_p1).add(_p2).add(_p3).multiplyScalar(0.25);
				const iCenter = newPositionArray.length / 3;
				_v3.toArray(newPositionArray, newPositionArray.length);
				// add edge centers
				const i01 = _findOrCreateEdgeCenterIndex(i0, i1);
				const i12 = _findOrCreateEdgeCenterIndex(i1, i2);
				const i23 = _findOrCreateEdgeCenterIndex(i2, i3);
				const i30 = _findOrCreateEdgeCenterIndex(i3, i0);
				// _v3.copy(_p0).add(_p1).multiplyScalar(0.5);
				// const i01 = newPositionArray.length / 3;
				// _v3.toArray(newPositionArray, newPositionArray.length);
				// add edge 1-2
				// _v3.copy(_p1).add(_p2).multiplyScalar(0.5);
				// const i12 = newPositionArray.length / 3;
				// _v3.toArray(newPositionArray, newPositionArray.length);
				// add edge 2-3
				// _v3.copy(_p2).add(_p3).multiplyScalar(0.5);
				// const i23 = newPositionArray.length / 3;
				// _v3.toArray(newPositionArray, newPositionArray.length);
				// add edge 3-0
				// _v3.copy(_p3).add(_p0).multiplyScalar(0.5);
				// const i30 = newPositionArray.length / 3;
				// _v3.toArray(newPositionArray, newPositionArray.length);
				// add 4 quads
				quadIndices.push(i0, i01, iCenter, i30);
				quadIndices.push(i1, i12, iCenter, i01);
				quadIndices.push(i2, i23, iCenter, i12);
				quadIndices.push(i3, i30, iCenter, i23);
			}
			// we only add one quad per loop, even if not regular,
			// as the count is too unpredictable otherwise
			quadsCount++;
		}

		return _completeQuadObject();
	}
}
