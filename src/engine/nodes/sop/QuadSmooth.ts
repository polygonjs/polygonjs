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
import {Vector3} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {setToArray} from '../../../core/SetUtils';
import {InputCloneMode} from '../../poly/InputCloneMode';

const _current = new Vector3();
const _neighbourAverage = new Vector3();
const _neighbour = new Vector3();
// const _neighbours:Vector3[] = []

class QuadSmoothSopParamsConfig extends NodeParamsConfig {
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
	private _smoothQuadGeometry(geometry: QuadGeometry) {
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
				_neighbourAverage.set(0, 0, 0);
				for (const adjacentId of adjacentIds) {
					// _neighbours[i] = _neighbours[i] || new Vector3()
					// const _vA = _neighbours[i]
					_neighbour.fromArray(previousPositionArray, adjacentId * 3);
					_neighbourAverage.add(_neighbour);

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
		position.array = nextPositionArray;
	}
}
