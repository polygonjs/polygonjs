import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry} from 'three';
import {BufferAttribute, Float32BufferAttribute} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreString} from '../../../core/String';
import {ATTRIBUTE_CLASSES, AttribClass} from '../../../core/geometry/Constant';
import {TypeAssert} from '../../../engine/poly/Assert';
import {CoreObject} from '../../../core/geometry/Object';
interface AttribCopySopParams extends DefaultOperationParams {
	class: number;
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
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
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
		const attribClass = ATTRIBUTE_CLASSES[params.class];
		const newNames = CoreString.attribNames(params.newName);

		if (attribClass == AttribClass.VERTEX) {
			// for geometry attributes, first iterate over the existing attributes
			const srcAttribNames = coreGroupSrc.geoAttribNamesMatchingMask(params.name);
			for (let i = 0; i < srcAttribNames.length; i++) {
				const srcAttribName = srcAttribNames[i];
				let destAttribName = isBooleanTrue(params.tnewName) ? newNames[i] : srcAttribName;
				if (!destAttribName) {
					this.states?.error.set(`no matching new attribute name of ${srcAttribName}`);
					return coreGroupDest;
				}
				this._copyAttributeBetweenCoreGroups(attribClass, {
					attribName: {
						src: srcAttribName,
						dest: destAttribName,
					},
					params,
					coreGroup: {src: coreGroupSrc, dest: coreGroupDest},
				});
			}
		} else {
			// for object attributes, first iterate over the existing attributes
			const attribNames = CoreString.attribNames(params.name);
			for (let i = 0; i < attribNames.length; i++) {
				const destAttribName = isBooleanTrue(params.tnewName) ? newNames[i] : attribNames[i];
				this._copyAttributeBetweenCoreGroups(attribClass, {
					attribName: {
						src: attribNames[i],
						dest: destAttribName,
					},
					params,
					coreGroup: {src: coreGroupSrc, dest: coreGroupDest},
				});
			}
		}

		return coreGroupDest;
	}

	private _copyAttributeBetweenCoreGroups(attribClass: AttribClass, copyArgs: CopyBetweenCoreGroupsArgs) {
		switch (attribClass) {
			case AttribClass.VERTEX:
				this._copyAttributesBetweenGeometries(copyArgs);
				return;
			case AttribClass.OBJECT:
				this._copyAttributesBetweenObjects(copyArgs);
				return;
			case AttribClass.CORE_GROUP:
				this._copyAttributesBetweenCoreGroups(copyArgs);
				return;
		}
		TypeAssert.unreachable(attribClass);
	}
	private _copyAttributesBetweenGeometries(copyArgs: CopyBetweenCoreGroupsArgs) {
		const {coreGroup, attribName, params} = copyArgs;
		const srcObjects = coreGroup.src.threejsObjectsWithGeo();
		const destObjects = coreGroup.dest.threejsObjectsWithGeo();

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
	private _copyAttributesBetweenObjects(copyArgs: CopyBetweenCoreGroupsArgs) {
		const {coreGroup, attribName} = copyArgs;
		const srcObjects = coreGroup.src.allObjects();
		const destObjects = coreGroup.dest.allObjects();

		if (destObjects.length > srcObjects.length) {
			this.states?.error.set('second input does not have enough objects to copy attributes from');
		} else {
			for (let i = 0; i < destObjects.length; i++) {
				const destObject = destObjects[i];
				const srcObject = srcObjects[i];
				const srcAttribValue = CoreObject.attribValue(srcObject, attribName.src);
				if (srcAttribValue != null) {
					CoreObject.setAttribute(destObject, attribName.dest, srcAttribValue);
				}
			}
		}
	}
	private _copyAttributesBetweenCoreGroups(copyArgs: CopyBetweenCoreGroupsArgs) {
		const {coreGroup, attribName} = copyArgs;
		const srcCoreGroup = coreGroup.src;
		const destCoreGroup = coreGroup.dest;

		const srcAttribValue = srcCoreGroup.attribValue(attribName.src);
		if (srcAttribValue != null) {
			destCoreGroup.setAttribValue(attribName.dest, srcAttribValue);
		}
	}

	private _copyPointAttributesBetweenGeometries(copyArgs: CopyBetweenGeometriesArgs) {
		const {geo, attribName, params} = copyArgs;
		const srcAttrib = geo.src.getAttribute(attribName.src) as BufferAttribute | undefined;
		if (srcAttrib) {
			const size = srcAttrib.itemSize;
			const destAttrib = geo.dest.getAttribute(attribName.dest) as BufferAttribute | undefined;
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
				const destPointsCount = (geo.dest.getAttribute('position') as BufferAttribute).array.length / 3;
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
