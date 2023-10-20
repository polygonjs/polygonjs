/**
 * Creates a quad plane.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/modules/quad/QuadGeometry';
import {Vector3, BufferGeometry, Mesh, BufferAttribute} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {Number3} from '../../../types/GlobalTypes';
import {sample} from '../../../core/ArrayUtils';
import {TriangleGraph} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraph';
import {objectContentCopyProperties} from '../../../core/geometry/ObjectContent';
import {triangleGraphFindExpandedEdge} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraphUtils';

const _v3 = new Vector3();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();

class QuadrangulateSopParamsConfig extends NodeParamsConfig {
	/** @param quadsCount */
	// quadsCount = ParamConfig.INTEGER(1, {
	// 	range: [0, 1000],
	// 	rangeLocked: [true, false],
	// });
	/** @param regular */
	regular = ParamConfig.BOOLEAN(1);
	/** @param test */
	granular = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			regular: 0,
		},
	});
	/** @param irregularAmount */
	irregularAmount = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
		visibleIf: {
			granular: 1,
			regular: 0,
		},
	});
	/** @param subdivide */
	subdivide = ParamConfig.BOOLEAN(1, {
		visibleIf: {
			regular: 0,
		},
	});
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
					objectContentCopyProperties(object, newQuadObject);
					newQuadObject.geometry.applyMatrix(object.matrix);
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
		const {regular, granular, irregularAmount, subdivide, seed} = this.pv;

		const quadGeometry = new QuadGeometry();
		const newPositionArray = [...(positionAttribute.clone().array as number[])];

		const quadIndices: number[] = [];

		const graph = new TriangleGraph();
		for (let i = 0; i < polygonsCount; i++) {
			_v3.fromArray(index.array, i * 3);
			graph.addTriangle(_v3.toArray() as Number3);
		}
		const edgeIds: string[] = [];
		graph.edgeIds(edgeIds);
		edgeIds.sort();

		//
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

		const _completeQuadObject = () => {
			// if non regular, we also need to add the remaining triangles
			if (regular == false && subdivide) {
				graph.traverseTriangles((triangle) => {
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

					// add 3 quads
					quadIndices.push(i0, i01, iCenter, i20);
					quadIndices.push(i1, i12, iCenter, i01);
					quadIndices.push(i2, i20, iCenter, i12);
				});
			}

			const position = new BufferAttribute(new Float32Array(newPositionArray), 3);
			quadGeometry.setAttribute(Attribute.POSITION, position);
			quadGeometry.setIndex(quadIndices);
			const quadObject = new QuadObject(quadGeometry);
			return quadObject;
		};

		const _nextEdgeIdWithRegularMethod = () => {
			return edgeIds.pop();
		};
		// let _lastRemoveTriangles: TriangeNodePair | undefined;
		let _preparedNextEdgeId: string | undefined;
		const visitedEdgeIds: Set<string> = new Set();

		const _prepareNextEdgeId = (startEdgeId: string, step: number) => {
			const foundEdgeId = triangleGraphFindExpandedEdge(
				graph,
				startEdgeId,
				seed,
				step,
				irregularAmount,
				visitedEdgeIds
			);

			_preparedNextEdgeId = foundEdgeId;
		};
		const _nextEdgeIdWithIrregularMethod = (i: number) => {
			const _randomSample = () => {
				return sample(edgeIds, seed + i);
			};
			const _sampleFromIrregularity = () => {
				if (_preparedNextEdgeId != null) {
					return _preparedNextEdgeId;
				}

				return _randomSample();
			};

			const edgeId = granular == true ? _sampleFromIrregularity() : _randomSample();
			if (edgeId != null) {
				const index = edgeIds.indexOf(edgeId);

				if (index < 0) {
					console.log('bad edge found', edgeId, [...edgeIds].sort().join(', '));
					throw 'internal error';
				}
				edgeIds.splice(index, 1);
			}
			return edgeId;
		};

		let i = 0;
		while (edgeIds.length > 0) {
			i++;
			const edgeId = regular ? _nextEdgeIdWithRegularMethod() : _nextEdgeIdWithIrregularMethod(i);

			if (edgeId == null) {
				return _completeQuadObject();
			}

			visitedEdgeIds.add(edgeId);

			const _prepareNextEdgeIdIfTest = () => {
				if (granular == true && regular == false) {
					_prepareNextEdgeId(edgeId, i);
				}
			};

			const edge = graph.edge(edgeId);
			if (!edge) {
				_prepareNextEdgeIdIfTest();
				continue;
			}
			const triangleIds = edge.triangleIds;
			const triangle0 = graph.triangle(triangleIds[0]);
			const triangle1 = graph.triangle(triangleIds[1]);
			if (!triangle0 || !triangle1) {
				_prepareNextEdgeIdIfTest();
				continue;
			}
			// when using irregular method,
			// we get the triangle neighbours now, before deleting the triangles
			_prepareNextEdgeIdIfTest();

			// remove triangles
			graph.removeTriangle(triangle0.id);
			graph.removeTriangle(triangle1.id);
			// create quad
			const i0 = triangle0.triangle.find(
				(index) => index != edge.pointIdPair.id0 && index != edge.pointIdPair.id1
			)!;
			const i2 = triangle1.triangle.find(
				(index) => index != edge.pointIdPair.id0 && index != edge.pointIdPair.id1
			)!;
			const triangle0UnsharedIndexIndex = triangle0.triangle.indexOf(i0);
			const triangle1UnsharedIndexIndex = triangle1.triangle.indexOf(i2);
			const i1 = triangle0.triangle[(triangle0UnsharedIndexIndex + 1) % 3];
			const i3 = triangle1.triangle[(triangle1UnsharedIndexIndex + 1) % 3];
			if (regular == true || subdivide == false) {
				quadIndices.push(i0, i1, i2, i3);
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
				// add 4 quads
				quadIndices.push(i0, i01, iCenter, i30);
				quadIndices.push(i1, i12, iCenter, i01);
				quadIndices.push(i2, i23, iCenter, i12);
				quadIndices.push(i3, i30, iCenter, i23);
			}
		}

		return _completeQuadObject();
	}
}
