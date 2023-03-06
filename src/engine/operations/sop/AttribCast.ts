import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {
	Float64BufferAttribute,
	Float32BufferAttribute,
	Float16BufferAttribute,
	Uint32BufferAttribute,
	Int32BufferAttribute,
	Uint16BufferAttribute,
	Int16BufferAttribute,
	Uint8ClampedBufferAttribute,
	Uint8BufferAttribute,
	Int8BufferAttribute,
	BufferAttribute,
} from 'three';
import {BufferGeometry} from 'three';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';

export enum AttribType {
	Float64BufferAttribute = 'Float64BufferAttribute',
	Float32BufferAttribute = 'Float32BufferAttribute',
	Float16BufferAttribute = 'Float16BufferAttribute',
	Uint32BufferAttribute = 'Uint32BufferAttribute',
	Int32BufferAttribute = 'Int32BufferAttribute',
	Uint16BufferAttribute = 'Uint16BufferAttribute',
	Int16BufferAttribute = 'Int16BufferAttribute',
	Uint8ClampedBufferAttribute = 'Uint8ClampedBufferAttribute',
	Uint8BufferAttribute = 'Uint8BufferAttribute',
	Int8BufferAttribute = 'Int8BufferAttribute',
}

export const ATTRIB_TYPES: AttribType[] = [
	AttribType.Float64BufferAttribute,
	AttribType.Float32BufferAttribute,
	AttribType.Float16BufferAttribute,
	AttribType.Uint32BufferAttribute,
	AttribType.Int32BufferAttribute,
	AttribType.Uint16BufferAttribute,
	AttribType.Int16BufferAttribute,
	AttribType.Uint8ClampedBufferAttribute,
	AttribType.Uint8BufferAttribute,
	AttribType.Int8BufferAttribute,
];
const ATTRIB_CLASS_BY_TYPE = {
	[AttribType.Float64BufferAttribute]: Float64BufferAttribute,
	[AttribType.Float32BufferAttribute]: Float32BufferAttribute,
	[AttribType.Float16BufferAttribute]: Float16BufferAttribute,
	[AttribType.Uint32BufferAttribute]: Uint32BufferAttribute,
	[AttribType.Int32BufferAttribute]: Int32BufferAttribute,
	[AttribType.Uint16BufferAttribute]: Uint16BufferAttribute,
	[AttribType.Int16BufferAttribute]: Int16BufferAttribute,
	[AttribType.Uint8ClampedBufferAttribute]: Uint8ClampedBufferAttribute,
	[AttribType.Uint8BufferAttribute]: Uint8BufferAttribute,
	[AttribType.Int8BufferAttribute]: Int8BufferAttribute,
};
const ARRAY_CLASS_BY_TYPE = {
	[AttribType.Float64BufferAttribute]: Float64Array,
	[AttribType.Float32BufferAttribute]: Float32Array,
	[AttribType.Float16BufferAttribute]: Uint16Array,
	[AttribType.Uint32BufferAttribute]: Uint32Array,
	[AttribType.Int32BufferAttribute]: Int32Array,
	[AttribType.Uint16BufferAttribute]: Uint16Array,
	[AttribType.Int16BufferAttribute]: Int16Array,
	[AttribType.Uint8ClampedBufferAttribute]: Uint8Array,
	[AttribType.Uint8BufferAttribute]: Uint8Array,
	[AttribType.Int8BufferAttribute]: Int8Array,
};

interface AttribCastSopParams extends DefaultOperationParams {
	castAttributes: boolean;
	mask: string;
	castIndex: boolean;
	type: number;
}

export class AttribCastSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribCastSopParams = {
		castAttributes: true,
		mask: '*',
		castIndex: false,
		type: ATTRIB_TYPES.indexOf(AttribType.Float32BufferAttribute),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribCast'> {
		return 'attribCast';
	}

	override cook(input_contents: CoreGroup[], params: AttribCastSopParams) {
		const core_group = input_contents[0];
		const objects = core_group.threejsObjectsWithGeo();
		for (let object of objects) {
			this._castGeoAttributes(object.geometry, params);
		}

		return core_group;
	}

	private _castGeoAttributes(geometry: BufferGeometry, params: AttribCastSopParams) {
		const type = ATTRIB_TYPES[params.type];
		const attrib_class = ATTRIB_CLASS_BY_TYPE[type];
		const array_class = ARRAY_CLASS_BY_TYPE[type];

		if (isBooleanTrue(params.castAttributes)) {
			const attrib_names = CoreGeometry.attribNamesMatchingMask(geometry, params.mask);
			for (let attrib_name of attrib_names) {
				const attrib: BufferAttribute = geometry.attributes[attrib_name] as BufferAttribute;
				const array = attrib.array;
				const count = attrib.count;
				const itemSize = attrib.itemSize;
				const new_array = new array_class(count * itemSize);
				for (let i = 0; i < array.length; i++) {
					new_array[i] = array[i];
				}
				const new_attr = new attrib_class(new_array, 1);
				geometry.setAttribute(attrib_name, new_attr);
			}
		}

		// index
		if (params.castIndex) {
			const index = geometry.getIndex();
			if (index) {
				const array = index.array;
				const count = index.count;
				const itemSize = 1;

				const new_array = new array_class(count * itemSize);
				for (let i = 0; i < array.length; i++) {
					new_array[i] = array[i];
				}

				const new_attr = new attrib_class(new_array, 1);
				geometry.setIndex(new_attr);
			}
		}
	}
}
