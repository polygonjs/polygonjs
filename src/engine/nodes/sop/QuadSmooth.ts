/**
 * Creates a quad plane.
 *
 *
 */
import {Vector3, Triangle, Quaternion} from 'three';
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/quad/QuadGeometry';
import {Attribute} from '../../../core/geometry/Attribute';
import {setToArray} from '../../../core/SetUtils';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
// import {getCircumCenter} from '../../../core/geometry/tet/utils/tetCenter';

const _current = new Vector3();
const _neighbourAverage = new Vector3();
const _neighbour = new Vector3();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();
const _delta0 = new Vector3();
const _delta1 = new Vector3();
const _delta2 = new Vector3();
const _delta3 = new Vector3();
const _currentDelta0 = new Vector3();
const _currentDelta1 = new Vector3();
const _currentDelta2 = new Vector3();
const _currentDelta3 = new Vector3();
const _center = new Vector3();
const _triangle = new Triangle();
const _triangleNormal = new Vector3();
const _q = new Quaternion();
const _average = new Vector3();
// const _sphere = new Sphere()
// const _neighbours:Vector3[] = []
enum QuadSmoothMethod {
	AVERAGE = 'average',
	SQUARIFY = 'squarify',
}
const QUAD_SMOOTH_METHODS: QuadSmoothMethod[] = [QuadSmoothMethod.AVERAGE, QuadSmoothMethod.SQUARIFY];

class QuadSmoothSopParamsConfig extends NodeParamsConfig {
	/** @param method */
	method = ParamConfig.INTEGER(QUAD_SMOOTH_METHODS.indexOf(QuadSmoothMethod.AVERAGE), {
		menu: {
			entries: QUAD_SMOOTH_METHODS.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param iterations */
	iterations = ParamConfig.INTEGER(10, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param strength */
	strength = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new QuadSmoothSopParamsConfig();

export class QuadSmoothSopNode extends QuadSopNode<QuadSmoothSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_SMOOTH;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const quadObjects = coreGroup.quadObjects();

		if (quadObjects) {
			for (const object of quadObjects) {
				this._smoothQuadGeometry(object.geometry);
			}
		}

		this.setCoreGroup(coreGroup);
	}
	setMethod(method: QuadSmoothMethod) {
		this.p.method.set(QUAD_SMOOTH_METHODS.indexOf(method));
	}
	method() {
		return QUAD_SMOOTH_METHODS[this.pv.method];
	}
	private _smoothQuadGeometry(geometry: QuadGeometry) {
		const method = this.method();
		switch (method) {
			case QuadSmoothMethod.AVERAGE:
				return this._smoothQuadGeometryWithAverage(geometry);
			case QuadSmoothMethod.SQUARIFY:
				return this._smoothQuadGeometryWithSquarify(geometry);
		}
		TypeAssert.unreachable(method);
	}
	private _smoothQuadGeometryWithAverage(geometry: QuadGeometry) {
		const position = geometry.attributes[Attribute.POSITION];
		if (!position) {
			return;
		}
		const tmpPositionArray0 = [...position.array];
		const tmpPositionArray1 = [...tmpPositionArray0];

		const index = geometry.index;
		const quadsCount = geometry.quadsCount();
		const adjacentIdByIndexWithSets = new Map<number, Set<number>>();
		const quadCountByEdge = new Map<number, Map<number, Set<number>>>();
		const _addQuadCount = (quadIndex: number, i0: number, i1: number) => {
			let quadCountByEdgeEntry = quadCountByEdge.get(i0);
			if (!quadCountByEdgeEntry) {
				quadCountByEdgeEntry = new Map();
				quadCountByEdge.set(i0, quadCountByEdgeEntry);
			}
			let quadIndices = quadCountByEdgeEntry.get(i1);
			if (!quadIndices) {
				quadIndices = new Set();
			}
			quadIndices.add(quadIndex);
			quadCountByEdgeEntry.set(i1, quadIndices);
		};
		const _addAdjacency = (quadIndex: number, current: number, adjacent: number) => {
			let adjacentIds = adjacentIdByIndexWithSets.get(current);
			if (!adjacentIds) {
				adjacentIds = new Set<number>();
				adjacentIdByIndexWithSets.set(current, adjacentIds);
			}
			adjacentIds.add(adjacent);
			// add quad count
			_addQuadCount(quadIndex, current, adjacent);
			_addQuadCount(quadIndex, adjacent, current);
		};

		for (let i = 0; i < quadsCount; i++) {
			const i4 = i * 4;
			const i0 = index[i4 + 0];
			const i1 = index[i4 + 1];
			const i2 = index[i4 + 2];
			const i3 = index[i4 + 3];
			// i0
			_addAdjacency(i, i0, i3);
			_addAdjacency(i, i0, i1);
			// i1
			_addAdjacency(i, i1, i0);
			_addAdjacency(i, i1, i2);
			// i2
			_addAdjacency(i, i2, i1);
			_addAdjacency(i, i2, i3);
			// i3
			_addAdjacency(i, i3, i2);
			_addAdjacency(i, i3, i0);
		}
		const adjacentIdByIndex = new Map<number, number[]>();
		adjacentIdByIndexWithSets.forEach((adjacentIds, index) => {
			adjacentIdByIndex.set(index, setToArray(adjacentIds));
		});
		adjacentIdByIndexWithSets.clear();

		// keep track of points that are on unshared edges,
		// since we don't want to smoot those
		const pointsOnUnsharedEdges = new Set<number>();
		adjacentIdByIndex.forEach((_, index) => {
			const quadCountByEdgeEntry = quadCountByEdge.get(index);
			if (!quadCountByEdgeEntry) {
				return;
			}
			quadCountByEdgeEntry.forEach((quadIndices, key1) => {
				if (quadIndices.size == 1) {
					pointsOnUnsharedEdges.add(index);
				}
			});
		});

		// smooth
		const iterations = this.pv.iterations;
		const strength = this.pv.strength;
		const lerp = 1 - strength;
		let previousPositionArray = tmpPositionArray0;
		let nextPositionArray = tmpPositionArray1;
		for (let i = 0; i < iterations; i++) {
			// let neighboursCount=0
			adjacentIdByIndex.forEach((adjacentIds, index) => {
				// do not smooth if on an unshared edge
				if (pointsOnUnsharedEdges.has(index)) {
					return;
				}

				//
				_current.fromArray(previousPositionArray, index * 3);
				// i=0
				// _sphere.center.set(_current.x, _current.y, _current.z);
				// _sphere.radius = 0;
				_neighbourAverage.set(0, 0, 0);
				for (const adjacentId of adjacentIds) {
					// _neighbours[i] = _neighbours[i] || new Vector3()
					// const _vA = _neighbours[i]
					_neighbour.fromArray(previousPositionArray, adjacentId * 3);
					_neighbourAverage.add(_neighbour);
					// _sphere.expandByPoint(_neighbour);
					// i++
				}
				_neighbourAverage.divideScalar(adjacentIds.length);
				_neighbourAverage.lerp(_current, lerp);
				_neighbourAverage.toArray(nextPositionArray, index * 3);
			});
			// swap arrays
			const tmp = nextPositionArray;
			nextPositionArray = previousPositionArray;
			previousPositionArray = tmp;
		}

		// write back to geometry
		position.array = previousPositionArray;
	}
	private _smoothQuadGeometryWithSquarify(geometry: QuadGeometry) {
		const position = geometry.attributes[Attribute.POSITION];
		if (!position) {
			return;
		}
		const iterations = this.pv.iterations;
		const strength = this.pv.strength;
		// const lerp = 1 - strength;
		const positionArray = position.array;
		const pointsCount = positionArray.length / 3;
		// const tmpPositionArray0 = [...position.array];
		// const tmpPositionArray1 = [...tmpPositionArray0];
		const deltas = new Array(positionArray.length).fill(0);
		const deltasCount = new Array(pointsCount).fill(0);

		//
		const index = geometry.index;
		const indicesCount = index.length;
		let previousPositionArray = positionArray; //tmpPositionArray0;
		let nextPositionArray = positionArray; //tmpPositionArray1;
		// const quadsCount = geometry.quadsCount();
		for (let i = 0; i < iterations; i++) {
			deltas.fill(0);
			for (let q = 0; q < indicesCount; q += 4) {
				const i0 = index[q + 0];
				const i1 = index[q + 1];
				const i2 = index[q + 2];
				const i3 = index[q + 3];
				const i0_3 = i0 * 3;
				const i1_3 = i1 * 3;
				const i2_3 = i2 * 3;
				const i3_3 = i3 * 3;
				_p0.fromArray(previousPositionArray, i0_3);
				_p1.fromArray(previousPositionArray, i1_3);
				_p2.fromArray(previousPositionArray, i2_3);
				_p3.fromArray(previousPositionArray, i3_3);
				_delta0.copy(_p0);
				_delta1.copy(_p1);
				_delta2.copy(_p2);
				_delta3.copy(_p3);
				_triangle.a.copy(_p0);
				_triangle.b.copy(_p1);
				_triangle.c.copy(_p2);
				_triangle.getNormal(_triangleNormal);
				_center.copy(_p0).add(_p1).add(_p2).add(_p3).multiplyScalar(0.25);
				// getCircumCenter(_p0, _p1, _p2, _p3, _center);
				// console.log('_center', _center.toArray());
				// rotate each vec
				_p0.sub(_center);
				_p1.sub(_center);
				_p2.sub(_center);
				_p3.sub(_center);
				// align all 4 vectors
				_q.setFromAxisAngle(_triangleNormal, -Math.PI * 0.5);
				_p1.applyQuaternion(_q);
				_q.setFromAxisAngle(_triangleNormal, -Math.PI * 1);
				_p2.applyQuaternion(_q);
				_q.setFromAxisAngle(_triangleNormal, -Math.PI * 1.5);
				_p3.applyQuaternion(_q);
				// get average
				_average.copy(_p0).add(_p1).add(_p2).add(_p3).multiplyScalar(0.25);
				_p0.lerp(_average, strength);
				_p1.lerp(_average, strength);
				_p2.lerp(_average, strength);
				_p3.lerp(_average, strength);
				// rotate back
				_q.setFromAxisAngle(_triangleNormal, +Math.PI * 0.5);
				_p1.applyQuaternion(_q);
				_q.setFromAxisAngle(_triangleNormal, +Math.PI * 1);
				_p2.applyQuaternion(_q);
				_q.setFromAxisAngle(_triangleNormal, +Math.PI * 1.5);
				_p3.applyQuaternion(_q);
				_p0.add(_center);
				_p1.add(_center);
				_p2.add(_center);
				_p3.add(_center);

				// accumulate deltas
				_delta0.sub(_p0).multiplyScalar(-1);
				_delta1.sub(_p1).multiplyScalar(-1);
				_delta2.sub(_p2).multiplyScalar(-1);
				_delta3.sub(_p3).multiplyScalar(-1);
				_currentDelta0.fromArray(deltas, i0_3);
				_currentDelta1.fromArray(deltas, i1_3);
				_currentDelta2.fromArray(deltas, i2_3);
				_currentDelta3.fromArray(deltas, i3_3);
				_delta0.add(_currentDelta0).toArray(deltas, i0_3);
				_delta1.add(_currentDelta1).toArray(deltas, i1_3);
				_delta2.add(_currentDelta2).toArray(deltas, i2_3);
				_delta3.add(_currentDelta3).toArray(deltas, i3_3);
				deltasCount[i0]++;
				deltasCount[i1]++;
				deltasCount[i2]++;
				deltasCount[i3]++;

				// write to array
				// _p0.toArray(nextPositionArray, index[q + 0] * 3);
				// _p1.toArray(nextPositionArray, index[q + 1] * 3);
				// _p2.toArray(nextPositionArray, index[q + 2] * 3);
				// _p3.toArray(nextPositionArray, index[q + 3] * 3);
			}
			// apply delta
			// console.log(deltasCount);
			for (let i = 0; i < pointsCount; i++) {
				const deltaCount = deltasCount[i];
				if (deltaCount > 0) {
					_current.fromArray(previousPositionArray, i * 3);
					_currentDelta0.fromArray(deltas, i * 3).divideScalar(deltaCount);
					// console.log(i, _currentDelta0.toArray());
					_current.add(_currentDelta0);
					_current.toArray(nextPositionArray, i * 3);
				}
			}

			// swap arrays
			// const tmp = nextPositionArray;
			// nextPositionArray = previousPositionArray;
			// previousPositionArray = tmp;
		}
		// write back to geometry
		position.array = previousPositionArray;
	}
}
