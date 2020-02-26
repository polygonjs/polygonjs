import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
class AttribCopySopParamsConfig extends NodeParamsConfig {
	// class = ParamConfig.INTEGER(CoreConstant.ATTRIB_CLASS.VERTEX, {
	// 	menu: {
	// 		entries: [
	// 			{name: 'vertex', value: CoreConstant.ATTRIB_CLASS.VERTEX},
	// 			{name: 'object', value: CoreConstant.ATTRIB_CLASS.OBJECT},
	// 		],
	// 	},
	// })
	name = ParamConfig.STRING('');
	tnew_name = ParamConfig.BOOLEAN(0);
	new_name = ParamConfig.STRING('', {visible_if: {tnew_name: 1}});
	// to_all_components = ParamConfig.BOOLEAN(1)
	// src_component = ParamConfig.INTEGER(0, {
	// 	range: [0, 2],
	// 	range_locked: [true, true],
	// 	visible_if: {to_all_components: 0},
	// })
	// dest_component = ParamConfig.INTEGER(0, {
	// 	range: [0, 2],
	// 	range_locked: [true, true],
	// 	visible_if: {to_all_components: 0},
	// })
}
const ParamsConfig = new AttribCopySopParamsConfig();

// TODO: attrib copy should handle string attributes
export class AttribCopySopNode extends TypedSopNode<AttribCopySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_copy';
	}

	static displayed_input_names(): string[] {
		return ['geometry to copy attributes to', 'geometry to copy attributes from'];
	}

	initialize_node() {
		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	create_params() {}

	cook(input_contents: CoreGroup[]) {
		const core_group_dest = input_contents[0];
		const core_group_src = input_contents[1];

		const attrib_names = core_group_src.attrib_names_matching_mask(this.pv.name);
		for (let attrib_name of attrib_names) {
			this.copy_vertex_attribute_between_core_groups(core_group_dest, core_group_src, attrib_name);
		}

		// switch (this.pv.class) {
		// 	case CoreConstant.ATTRIB_CLASS.VERTEX:
		// 		this.copy_vertex_attribute(core_group_dest, core_group_src);
		// 		break;
		// 	case CoreConstant.ATTRIB_CLASS.OBJECT:
		// 		this.copy_object_attribute(core_group_dest, core_group_src);
		// 		break;
		// }

		return this.set_core_group(core_group_dest);
	}

	private copy_vertex_attribute_between_core_groups(
		core_group_dest: CoreGroup,
		core_group_src: CoreGroup,
		attrib_name: string
	) {
		const src_objects = core_group_src.objects();
		const dest_objects = core_group_dest.objects();

		if (dest_objects.length > src_objects.length) {
			this.states.error.set('second input does not have enough objects to copy attributes from');
		} else {
			for (let i = 0; i < dest_objects.length; i++) {
				const dest_geometry = dest_objects[i].geometry;
				const src_geometry = dest_objects[i].geometry;
				this.copy_vertex_attribute_between_geometries(dest_geometry, src_geometry, attrib_name);
			}
		}
	}
	private copy_vertex_attribute_between_geometries(
		dest_geometry: BufferGeometry,
		src_geometry: BufferGeometry,
		attrib_name: string
	) {
		const src_attrib = src_geometry.getAttribute(attrib_name);
		if (src_attrib) {
			const size = src_attrib.itemSize;
			const src_points_count = src_geometry.getAttribute('position').array.length / 3;
			const dest_points_count = dest_geometry.getAttribute('position').array.length / 3;
			if (dest_points_count > src_points_count) {
				this.states.error.set('not enough points in second input');
			}
			const src_array = src_attrib.array as number[];
			const sub_array = src_array.slice(0, dest_points_count * size);
			const dest_name = this.pv.tnew_name ? this.pv.new_name : attrib_name;
			dest_geometry.setAttribute(dest_name, new Float32BufferAttribute(sub_array, size));
		} else {
			this.states.error.set(`attribute '${attrib_name}' does not exist on second input`);
		}
	}

	// _src_value_to_all_components(src_attrib_value: NumericAttribValue, dest_attrib_size) {
	// 	if (lodash_isNumber(src_attrib_value)) {
	// 		switch (dest_attrib_size) {
	// 			case 1:
	// 				return src_attrib_value;
	// 			case 2:
	// 				return new THREE.Vector2(src_attrib_value, src_attrib_value);
	// 			case 3:
	// 				return new THREE.Vector3(src_attrib_value, src_attrib_value, src_attrib_value);
	// 		}
	// 	} else {
	// 		switch (dest_attrib_size) {
	// 			case 1:
	// 				return src_attrib_value.x;
	// 			case 2:
	// 				return new THREE.Vector2(src_attrib_value.x, src_attrib_value.y);
	// 			case 3:
	// 				return new THREE.Vector3(
	// 					src_attrib_value.x,
	// 					src_attrib_value.y,
	// 					src_attrib_value.z || src_attrib_value.y
	// 				);
	// 		}
	// 	}
	// }

	// _src_value_to_component(src_attrib_value, current_dest_value, src_component, dest_component) {
	// 	const src_component_value = (() => {
	// 		switch (src_component) {
	// 			case 0:
	// 				return src_attrib_value.x || src_attrib_value;
	// 			case 1:
	// 				return src_attrib_value.y;
	// 			case 2:
	// 				return src_attrib_value.z;
	// 		}
	// 	})();

	// 	const dest_component_name = ['x', 'y', 'z'][dest_component];
	// 	if (current_dest_value[dest_component_name] != null) {
	// 		current_dest_value[dest_component_name] = src_component_value;
	// 		return current_dest_value;
	// 	} else {
	// 		const src_component_name = ['x', 'y', 'z'][src_component];
	// 		return src_attrib_value[src_component_name];
	// 	}
	// }

	// TODO: find a way to use the point method, but have the group api allow easy switch
	// private  copy_object_attribute(core_group_dest: CoreGroup, core_group_src:CoreGroup) {
	// 	// const objects_dest = core_group_dest.objects();
	// 	// const objects_src = core_group_src.objects();

	// 	//attribute_names = core_group_src.attrib_names_matching_mask(@_param_name)

	// 	//lodash_each attribute_names, (attrib_name) =>
	// 	const attrib_name = this.pv.name;

	// 	if (!core_group_dest.has_attrib(attrib_name)) {
	// 		const attrib_size = core_group_src.attrib_size(attrib_name);
	// 		core_group_dest.add_numeric_vertex_attrib(attrib_name, attrib_size, 0);
	// 	}

	// 	lodash_each(points_dest, (point_dest, i) => {
	// 		let point_src;
	// 		if ((point_src = points_src[i]) != null) {
	// 			const attrib_value = point_src.attrib_value(attrib_name);
	// 			point_dest.set_attrib_value(attrib_name, attrib_value);
	// 		}
	// 	});
	// }
}
