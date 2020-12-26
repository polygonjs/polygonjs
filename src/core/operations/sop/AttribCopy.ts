import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute, Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
interface AttribCopySopParams extends DefaultOperationParams {
	name: string;
	tnew_name: boolean;
	new_name: string;
	src_offset: number;
	dest_offset: number;
}

export class AttribCopySopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: AttribCopySopParams = {
		name: '',
		tnew_name: false,
		new_name: '',
		src_offset: 0,
		dest_offset: 0,
	};
	static readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static type(): Readonly<'attribCopy'> {
		return 'attribCopy';
	}

	cook(input_contents: CoreGroup[], params: AttribCopySopParams) {
		const core_group_dest = input_contents[0];
		const core_group_src = input_contents[1] || core_group_dest;

		const attrib_names = core_group_src.attrib_names_matching_mask(params.name);
		for (let attrib_name of attrib_names) {
			this.copy_vertex_attribute_between_core_groups(core_group_dest, core_group_src, attrib_name, params);
		}

		return core_group_dest;
	}

	private copy_vertex_attribute_between_core_groups(
		core_group_dest: CoreGroup,
		core_group_src: CoreGroup,
		attrib_name: string,
		params: AttribCopySopParams
	) {
		const src_objects = core_group_src.objects_with_geo();
		const dest_objects = core_group_dest.objects_with_geo();

		if (dest_objects.length > src_objects.length) {
			this.states?.error.set('second input does not have enough objects to copy attributes from');
		} else {
			for (let i = 0; i < dest_objects.length; i++) {
				const dest_geometry = dest_objects[i].geometry;
				const src_geometry = dest_objects[i].geometry;
				this.copy_vertex_attribute_between_geometries(dest_geometry, src_geometry, attrib_name, params);
			}
		}
	}
	private copy_vertex_attribute_between_geometries(
		dest_geometry: BufferGeometry,
		src_geometry: BufferGeometry,
		attrib_name: string,
		params: AttribCopySopParams
	) {
		const src_attrib = src_geometry.getAttribute(attrib_name);
		if (src_attrib) {
			const size = src_attrib.itemSize;
			const src_points_count = src_geometry.getAttribute('position').array.length / 3;
			const dest_points_count = dest_geometry.getAttribute('position').array.length / 3;
			if (dest_points_count > src_points_count) {
				this.states?.error.set('not enough points in second input');
			}

			const dest_name = params.tnew_name ? params.new_name : attrib_name;
			let dest_attribute = dest_geometry.getAttribute(dest_name);
			if (dest_attribute) {
				this._fill_dest_array(dest_attribute as BufferAttribute, src_attrib as BufferAttribute, params);
				(dest_attribute as BufferAttribute).needsUpdate = true;
			} else {
				const src_array = src_attrib.array as number[];
				const dest_array = src_array.slice(0, dest_points_count * size);
				dest_geometry.setAttribute(dest_name, new Float32BufferAttribute(dest_array, size));
			}
		} else {
			this.states?.error.set(`attribute '${attrib_name}' does not exist on second input`);
		}
	}

	private _fill_dest_array(
		dest_attribute: BufferAttribute,
		src_attribute: BufferAttribute,
		params: AttribCopySopParams
	) {
		const dest_array = dest_attribute.array as number[];
		const src_array = src_attribute.array as number[];
		const dest_array_size = dest_array.length;
		const dest_item_size = dest_attribute.itemSize;
		const src_item_size = src_attribute.itemSize;
		const src_offset = params.src_offset;
		const dest_offset = params.dest_offset;
		// if same itemSize, we copy item by item
		if (dest_attribute.itemSize == src_attribute.itemSize) {
			dest_attribute.copyArray(src_attribute.array);
			for (let i = 0; i < dest_array_size; i++) {
				dest_array[i] = src_array[i];
			}
		} else {
			const points_count = dest_array.length / dest_item_size;
			if (dest_item_size < src_item_size) {
				// if dest attrib is smaller than src attrib (ie: vector -> to float)
				// we copy only the selected items from src
				for (let i = 0; i < points_count; i++) {
					for (let j = 0; j < dest_item_size; j++) {
						dest_array[i * dest_item_size + j + dest_offset] =
							src_array[i * src_item_size + j + src_offset];
					}
				}
			} else {
				// if dest attrib is larger than src attrib (ie: float -> vector )
				for (let i = 0; i < points_count; i++) {
					for (let j = 0; j < src_item_size; j++) {
						dest_array[i * dest_item_size + j + dest_offset] =
							src_array[i * src_item_size + j + src_offset];
					}
				}
			}
		}
	}
}
