import {CoreMath} from './../../../core/math/_Module';
import {BaseCoreObject} from './../../../core/geometry/_BaseObject';
import {CoreObject} from './../../../core/geometry/Object';
import {TypeAssert} from './../../poly/Assert';
import {AttribClass} from './../../../core/geometry/Constant';
import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Vector3} from 'three';
import {MapUtils} from '../../../core/MapUtils';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {BufferAttribute} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {isBooleanTrue} from '../../../core/Type';
import {setToArray} from '../../../core/SetUtils';

const tmpPos = new Vector3();

export enum SortMode {
	RANDOM = 'random',
	AXIS = 'axis',
}
export const SORT_MODES: SortMode[] = [SortMode.AXIS, SortMode.RANDOM];

export const SORT_TARGET_TYPES: Array<AttribClass.VERTEX | AttribClass.OBJECT> = [
	AttribClass.VERTEX,
	AttribClass.OBJECT,
];

export enum Axis {
	X = 'x',
	Y = 'y',
	Z = 'z',
}
export const AXISES: Axis[] = [Axis.X, Axis.Y, Axis.Z];

interface SortSopParams extends DefaultOperationParams {
	mode: number;
	targetType: number;
	// random
	seed: number;
	// axis
	axis: number;
	// commpn
	invert: boolean;
}

export class SortSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SortSopParams = {
		mode: SORT_MODES.indexOf(SortMode.AXIS),
		targetType: SORT_TARGET_TYPES.indexOf(AttribClass.VERTEX),
		seed: 0,
		axis: AXISES.indexOf(Axis.X),
		invert: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'sort'> {
		return 'sort';
	}

	override cook(inputCoreGroups: CoreGroup[], params: SortSopParams) {
		const coreGroup = inputCoreGroups[0];
		this._sort(coreGroup, params);
		return coreGroup;
	}
	private _sort(coreGroup: CoreGroup, params: SortSopParams) {
		const targetType = SORT_TARGET_TYPES[params.targetType];
		switch (targetType) {
			case AttribClass.VERTEX:
				return this._sortPoints(coreGroup, params);
			case AttribClass.OBJECT:
				return this._sortObjects(coreGroup, params);
		}
	}

	private _sortObjects(coreGroup: CoreGroup, params: SortSopParams) {
		const sortMode = SORT_MODES[params.mode];
		switch (sortMode) {
			case SortMode.AXIS:
				return this._sortObjectsByAxis(coreGroup, params);
			case SortMode.RANDOM:
				return this._sortObjectsByRandom(coreGroup, params);
		}
		TypeAssert.unreachable(sortMode);
	}
	private _sortObjectsByAxis(coreGroup: CoreGroup, params: SortSopParams) {
		const coreObjects = coreGroup.allCoreObjects();
		const objectsByPos: Map<number, BaseCoreObject<CoreObjectType>[]> = new Map();
		const positions: Set<number> = new Set();

		// accumulate axisValue
		const axis = AXISES[params.axis];
		let axisValue: number = 0;
		for (let coreObject of coreObjects) {
			coreObject.position(tmpPos);
			switch (axis) {
				case Axis.X: {
					axisValue = tmpPos.x;
					break;
				}
				case Axis.Y: {
					axisValue = tmpPos.y;
					break;
				}
				case Axis.Z: {
					axisValue = tmpPos.z;
					break;
				}
			}
			positions.add(axisValue);
			MapUtils.pushOnArrayAtEntry(objectsByPos, axisValue, coreObject);
		}

		// sort
		let sortedPositions: number[] = setToArray(positions).sort((a, b) => a - b);
		if (isBooleanTrue(params.invert)) {
			sortedPositions.reverse();
		}

		const sortedObjects: ObjectContent<CoreObjectType>[] = [];
		for (let position of sortedPositions) {
			const coreObjectsForPosition = objectsByPos.get(position);
			if (coreObjectsForPosition) {
				for (let coreObjectForPosition of coreObjectsForPosition) {
					sortedObjects.push(coreObjectForPosition.object());
				}
			}
		}
		coreGroup.setAllObjects(sortedObjects);
	}
	private _sortObjectsByRandom(coreGroup: CoreGroup, params: SortSopParams) {
		const coreObjects = coreGroup.allCoreObjects();
		const objectsByPos: Map<number, BaseCoreObject<CoreObjectType>[]> = new Map();
		const positions: number[] = [];

		// accumulate axisValue
		let sortValue: number = 0;
		let i = 0;
		for (let coreObject of coreObjects) {
			sortValue = CoreMath.randFloat(params.seed, i);
			positions[i] = sortValue;
			MapUtils.pushOnArrayAtEntry(objectsByPos, sortValue, coreObject);
			i++;
		}

		// sort
		let sortedPositions: number[] = positions.sort((a, b) => a - b);
		if (params.invert) {
			sortedPositions.reverse();
		}

		const sortedObjects: ObjectContent<CoreObjectType>[] = [];
		for (let position of sortedPositions) {
			const coreObjectsForPosition = objectsByPos.get(position);
			if (coreObjectsForPosition) {
				for (let coreObjectForPosition of coreObjectsForPosition) {
					sortedObjects.push(coreObjectForPosition.object());
				}
			}
		}
		coreGroup.setAllObjects(sortedObjects);
	}

	private _sortPoints(coreGroup: CoreGroup, params: SortSopParams) {
		const sortMode = SORT_MODES[params.mode];
		switch (sortMode) {
			case SortMode.AXIS:
				return this._sortPointsByAxis(coreGroup, params);
			case SortMode.RANDOM:
				return this._sortPointsByRandom(coreGroup, params);
		}
		TypeAssert.unreachable(sortMode);
	}
	private _sortPointsByAxis(coreGroup: CoreGroup, params: SortSopParams) {
		const objects = coreGroup.threejsObjectsWithGeo();
		for (let object of objects) {
			this._sortPointsForObject(object, params);
		}
	}
	private _sortPointsByRandom(coreGroup: CoreGroup, params: SortSopParams) {
		this.states?.error.set('sorting points in random mode is not yet implemented');
	}

	private _pointPos = new Vector3();
	private _positions: number[] = [];
	private _indicesByPos: Map<number, number[]> = new Map();
	private _indexDest: Map<number, number> = new Map();
	private _debugActive = false;
	private _debug(a: any) {
		if (!this._debugActive) {
			return;
		}
	}
	private _sortPointsForObject(object: Object3DWithGeometry, params: SortSopParams) {
		const coreObject = new CoreObject(object, 0);
		const points = coreObject.points();

		const oldIndexAttribute = object.geometry.getIndex();
		if (!oldIndexAttribute) {
			console.warn('geometry cannot be sorted since it has no index');
			return;
		}
		const oldIndices = oldIndexAttribute.array;

		// reset
		this._positions = new Array(points.length);
		this._indicesByPos.clear();
		this._indexDest.clear();

		// accumulate axisValue
		const axis = AXISES[params.axis];
		let axisValue: number = 0;
		let i = 0;
		for (let point of points) {
			point.getPosition(this._pointPos);
			switch (axis) {
				case Axis.X: {
					axisValue = this._pointPos.x;
					break;
				}
				case Axis.Y: {
					axisValue = this._pointPos.y;
					break;
				}
				case Axis.Z: {
					axisValue = this._pointPos.z;
					break;
				}
			}
			this._positions[i] = axisValue;
			MapUtils.pushOnArrayAtEntry(this._indicesByPos, axisValue, point.index());
			i++;
		}

		// sort
		let sortedPositions: number[] = this._positions.sort((a, b) => a - b);
		if (params.invert) {
			sortedPositions.reverse();
		}

		// update the index attribute
		const newIndices: number[] = new Array(points.length);
		i = 0;
		// const uniqSortedPositions = ArrayUtils.uniq(sortedPositions);
		for (let position of sortedPositions) {
			const indices = this._indicesByPos.get(position);
			if (indices) {
				this._indicesByPos.delete(position);
				for (let index of indices) {
					newIndices[i] = index;
					this._indexDest.set(index, i);
					i++;
				}
			}
		}
		const newIndexAttrib = new Array(oldIndices.length);
		for (let i = 0; i < oldIndices.length; i++) {
			const oldIndex = oldIndices[i];
			const newI = this._indexDest.get(oldIndex);
			newIndexAttrib[i] = newI;
		}
		object.geometry.setIndex(newIndexAttrib);

		// update every attribute
		const attributeNames = CoreGeometry.attribNames(object.geometry);
		for (let attributeName of attributeNames) {
			if (attributeName == 'id') {
				this._debugActive = true;
			}
			const attribute = object.geometry.getAttribute(attributeName);
			this._updateAttribute(attribute as BufferAttribute, newIndices);
			this._debugActive = false;
		}
	}
	private _updateAttribute(attribute: BufferAttribute, newIndices: number[]) {
		const clonedAttribute = attribute.clone();
		const srcArray = attribute.array;
		const clonedArray = clonedAttribute.array as number[];
		const itemSize = clonedAttribute.itemSize;
		this._debug(newIndices);
		for (let newIndex of newIndices) {
			const oldIndex = this._indexDest.get(newIndex);
			this._debug(`${newIndex} -> ${oldIndex}`);
			if (oldIndex != null) {
				for (let i = 0; i < itemSize; i++) {
					clonedArray[oldIndex * itemSize + i] = srcArray[newIndex * itemSize + i];
				}
			} else {
				console.warn('no old index found');
			}
		}
		attribute.array = clonedArray;
		attribute.needsUpdate = true;
	}
}
