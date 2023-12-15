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
import {sample} from '../../../core/ArrayUtils';
import {objectContentCopyProperties} from '../../../core/geometry/ObjectContent';
import {
	getFirstEdgeIdBetweenTriangles,
	sortEdgesFromLargestToSmallest,
	triangleGraphFindExpandedEdge,
	triangleGraphFindNextLargest,
	triangleGraphFromGeometry,
} from '../../../core/geometry/modules/three/graph/triangle/TriangleGraphUtils';
import {triangleEdgeLength} from '../../../core/geometry/modules/three/graph/triangle/TriangleEdge';

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
		const graph = triangleGraphFromGeometry(geometry);
		if (!graph) {
			return;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttribute) {
			return;
		}
		const positions = geometry.getAttribute(Attribute.POSITION).array;
		const {regular, granular, irregularAmount, subdivide, seed} = this.pv;

		const quadGeometry = new QuadGeometry();
		const newPositionArray = [...positionAttribute.clone().array];

		const quadIndices: number[] = [];

		const edgeIds: string[] = [];
		graph.edgeIds(edgeIds);
		const edgeLengthById: Map<string, number> = new Map();
		for (const edgeId of edgeIds) {
			const edge = graph.edge(edgeId);
			if (edge) {
				edgeLengthById.set(edgeId, triangleEdgeLength(edge, positions));
			}
		}
		sortEdgesFromLargestToSmallest(edgeIds, edgeLengthById);

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

		let _preparedNextEdgeId: string | undefined;
		const visitedEdgeIds: Set<string> = new Set();
		const _randomSample = (step: number) => {
			return sample(edgeIds, seed + step);
		};
		const _prepareNextEdgeId = (startEdgeId: string, step: number) => {
			if (regular) {
				return triangleGraphFindNextLargest(edgeLengthById, graph, startEdgeId, visitedEdgeIds);
			} else {
				return triangleGraphFindExpandedEdge(
					edgeLengthById,
					graph,
					startEdgeId,
					// edgeIds,
					seed,
					step,
					irregularAmount,
					visitedEdgeIds,
					_randomSample
				);
			}
		};

		const _nextEdgeIdWithRegularMethod = () => {
			const foundEdgeId =
				_preparedNextEdgeId != null ? _preparedNextEdgeId : getFirstEdgeIdBetweenTriangles(graph, edgeIds);

			if (foundEdgeId != null) {
				const index = edgeIds.indexOf(foundEdgeId);
				if (index >= 0) {
					edgeIds.splice(index, 1);
				}
			}
			return foundEdgeId;
		};

		const _nextEdgeIdWithIrregularMethod = (step: number) => {
			const _sampleFromIrregularity = () => {
				return _preparedNextEdgeId != null ? _preparedNextEdgeId : _randomSample(step);
			};

			const edgeId = granular == true ? _sampleFromIrregularity() : _randomSample(step);
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

			const _prepareNextEdgeIdIfRequired = () => {
				// we need to prepare the next edge id here,
				// as we will delete the triangles from the graph
				// in the loop, which will make the current edge useless to traverse the graph.
				if (regular == true || (granular == true && regular == false)) {
					_preparedNextEdgeId = _prepareNextEdgeId(
						edgeId,
						i +
							1 /* we add 1 as we are computing for the next step. This is necessary to match the behavior when granular is off */
					);
				}
			};
			const edge = graph.edge(edgeId);
			if (!edge) {
				_prepareNextEdgeIdIfRequired();
				continue;
			}
			const triangleIds = edge.triangleIds;
			const triangle0 = graph.triangle(triangleIds[0]);
			const triangle1 = graph.triangle(triangleIds[1]);
			if (!triangle0 || !triangle1) {
				_prepareNextEdgeIdIfRequired();
				continue;
			}
			// when using irregular method,
			// we get the triangle neighbours now, before deleting the triangles
			_prepareNextEdgeIdIfRequired();

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
