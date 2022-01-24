import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute, Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
interface AttribCopySopParams extends DefaultOperationParams {
	name: string;
	tnewName: boolean;
	newName: string;
	srcOffset: number;
	destOffset: number;
}

export class AttribCopySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribCopySopParams = {
		name: '',
		tnewName: false,
		newName: '',
		srcOffset: 0,
		destOffset: 0,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'attribCopy'> {
		return 'attribCopy';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribCopySopParams) {
		const coreGroupDest = inputCoreGroups[0];
		const coreGroupSrc = inputCoreGroups[1] || coreGroupDest;

		const attribNames = coreGroupSrc.attribNamesMatchingMask(params.name);
		for (let attribName of attribNames) {
			this._copyPointAttributeBetweenCoreGroups(coreGroupDest, coreGroupSrc, attribName, params);
		}

		return coreGroupDest;
	}

	private _copyPointAttributeBetweenCoreGroups(
		coreGroupDest: CoreGroup,
		coreGroupSrc: CoreGroup,
		attribName: string,
		params: AttribCopySopParams
	) {
		const srcObjects = coreGroupSrc.objectsWithGeo();
		const destObjects = coreGroupDest.objectsWithGeo();

		if (destObjects.length > srcObjects.length) {
			this.states?.error.set('second input does not have enough objects to copy attributes from');
		} else {
			for (let i = 0; i < destObjects.length; i++) {
				const destGeometry = destObjects[i].geometry;
				const srcGeometry = srcObjects[i].geometry;
				this._copyPointAttributesBetweenGeometries(destGeometry, srcGeometry, attribName, params);
			}
		}
	}
	private _copyPointAttributesBetweenGeometries(
		destGeometry: BufferGeometry,
		srcGeometry: BufferGeometry,
		attribName: string,
		params: AttribCopySopParams
	) {
		const srcAttrib = srcGeometry.getAttribute(attribName);
		if (srcAttrib) {
			const size = srcAttrib.itemSize;
			const destName = isBooleanTrue(params.tnewName) ? params.newName : attribName;
			const destAttrib = destGeometry.getAttribute(destName);
			const srcPointsCount = srcAttrib.array.length / srcAttrib.itemSize;

			if (destAttrib) {
				const destPointsCount = destAttrib.array.length / destAttrib.itemSize;
				if (destPointsCount > srcPointsCount) {
					this.states?.error.set(`not enough points in second input`);
				} else {
					this._fillDestArray(destAttrib as BufferAttribute, srcAttrib as BufferAttribute, params);
					(destAttrib as BufferAttribute).needsUpdate = true;
				}
			} else {
				const src_array = srcAttrib.array as number[];
				const destPointsCount = destGeometry.getAttribute('position').array.length / 3;
				const dest_array = src_array.slice(0, destPointsCount * size);
				destGeometry.setAttribute(destName, new Float32BufferAttribute(dest_array, size));
			}
		} else {
			this.states?.error.set(`attribute '${attribName}' does not exist on second input`);
		}
	}

	private _fillDestArray(
		dest_attribute: BufferAttribute,
		src_attribute: BufferAttribute,
		params: AttribCopySopParams
	) {
		const dest_array = dest_attribute.array as number[];
		const src_array = src_attribute.array as number[];
		const dest_array_size = dest_array.length;
		const dest_item_size = dest_attribute.itemSize;
		const src_item_size = src_attribute.itemSize;
		const srcOffset = params.srcOffset;
		const destOffset = params.destOffset;
		// if same itemSize, we copy item by item
		if (dest_attribute.itemSize == src_attribute.itemSize) {
			dest_attribute.copyArray(src_attribute.array);
			for (let i = 0; i < dest_array_size; i++) {
				dest_array[i] = src_array[i];
			}
		} else {
			const pointsCount = dest_array.length / dest_item_size;
			if (dest_item_size < src_item_size) {
				// if dest attrib is smaller than src attrib (ie: vector -> to float)
				// we copy only the selected items from src
				for (let i = 0; i < pointsCount; i++) {
					for (let j = 0; j < dest_item_size; j++) {
						dest_array[i * dest_item_size + j + destOffset] = src_array[i * src_item_size + j + srcOffset];
					}
				}
			} else {
				// if dest attrib is larger than src attrib (ie: float -> vector )
				for (let i = 0; i < pointsCount; i++) {
					for (let j = 0; j < src_item_size; j++) {
						dest_array[i * dest_item_size + j + destOffset] = src_array[i * src_item_size + j + srcOffset];
					}
				}
			}
		}
	}
}
