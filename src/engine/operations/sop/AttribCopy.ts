import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {BufferGeometry} from 'three';
import {BufferAttribute, Float32BufferAttribute} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreString} from '../../../core/String';
interface AttribCopySopParams extends DefaultOperationParams {
	name: string;
	tnewName: boolean;
	newName: string;
	srcOffset: number;
	destOffset: number;
}

interface CopyArgs {
	params: AttribCopySopParams;
	attribName: {
		src: string;
		dest: string;
	};
}

interface CopyBetweenCoreGroupsArgs extends CopyArgs {
	coreGroup: {
		src: CoreGroup;
		dest: CoreGroup;
	};
}
interface CopyBetweenGeometriesArgs extends CopyArgs {
	geo: {
		src: BufferGeometry;
		dest: BufferGeometry;
	};
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

		const srcAttribNames = coreGroupSrc.geoAttribNamesMatchingMask(params.name);
		const newNames = CoreString.attribNames(params.newName);
		for (let i = 0; i < srcAttribNames.length; i++) {
			const srcAttribName = srcAttribNames[i];
			let destAttribName = isBooleanTrue(params.tnewName) ? newNames[i] : srcAttribName;
			if (!destAttribName) {
				this.states?.error.set(`no matching new attribute name of ${srcAttribName}`);
				return coreGroupDest;
			}
			this._copyPointAttributeBetweenCoreGroups({
				attribName: {
					src: srcAttribName,
					dest: destAttribName,
				},
				params,
				coreGroup: {src: coreGroupSrc, dest: coreGroupDest},
			});
		}

		return coreGroupDest;
	}

	private _copyPointAttributeBetweenCoreGroups(copyArgs: CopyBetweenCoreGroupsArgs) {
		const {coreGroup, attribName, params} = copyArgs;
		const srcObjects = coreGroup.src.objectsWithGeo();
		const destObjects = coreGroup.dest.objectsWithGeo();

		if (destObjects.length > srcObjects.length) {
			this.states?.error.set('second input does not have enough objects to copy attributes from');
		} else {
			for (let i = 0; i < destObjects.length; i++) {
				const destGeometry = destObjects[i].geometry;
				const srcGeometry = srcObjects[i].geometry;
				this._copyPointAttributesBetweenGeometries({
					geo: {src: srcGeometry, dest: destGeometry},
					attribName,
					params,
				});
			}
		}
	}
	private _copyPointAttributesBetweenGeometries(copyArgs: CopyBetweenGeometriesArgs) {
		const {geo, attribName, params} = copyArgs;
		const srcAttrib = geo.src.getAttribute(attribName.src);
		if (srcAttrib) {
			const size = srcAttrib.itemSize;
			const destAttrib = geo.dest.getAttribute(attribName.dest);
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
				const destPointsCount = geo.dest.getAttribute('position').array.length / 3;
				const dest_array = src_array.slice(0, destPointsCount * size);
				geo.dest.setAttribute(attribName.dest, new Float32BufferAttribute(dest_array, size));
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
