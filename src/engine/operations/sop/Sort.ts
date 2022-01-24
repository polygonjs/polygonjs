import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreObject} from '../../../core/geometry/Object';
import {Vector3} from 'three/src/math/Vector3';
import {MapUtils} from '../../../core/MapUtils';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {ArrayUtils} from '../../../core/ArrayUtils';

export enum Axis {
	X = 'x',
	Y = 'y',
	Z = 'z',
}
export const AXISES: Axis[] = [Axis.X, Axis.Y, Axis.Z];

interface SortSopParams extends DefaultOperationParams {
	axis: number;
	invert: boolean;
}

export class SortSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: SortSopParams = {
		axis: AXISES.indexOf(Axis.X),
		invert: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'sort'> {
		return 'sort';
	}

	override cook(input_contents: CoreGroup[], params: SortSopParams) {
		const coreGroup = input_contents[0];

		const objects = coreGroup.objectsWithGeo();
		for (let object of objects) {
			this._sortObject(object, params);
		}

		return coreGroup;
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
	private _sortObject(object: Object3DWithGeometry, params: SortSopParams) {
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
		const uniqSortedPositions = ArrayUtils.uniq(sortedPositions);
		for (let position of uniqSortedPositions) {
			const indices = this._indicesByPos.get(position);
			if (indices) {
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
