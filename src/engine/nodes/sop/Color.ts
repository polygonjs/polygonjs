import {Color} from 'three/src/math/Color';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {CoreColor} from 'src/core/Color';
// import lodash_times from 'lodash/times'
// import lodash_each from 'lodash/each'
// import {CoreGroup} from 'src/core/geometry/Group';
import {TypedSopNode} from './_Base';

import {CoreObject} from 'src/core/geometry/Object';
import {CoreGeometry} from 'src/core/geometry/Geometry';
import {CorePoint} from 'src/core/geometry/Point';

const DEFAULT_COLOR = new Color(1, 1, 1);
const COLOR_ATTRIB_NAME = 'color';

type ValueArrayByName = Dictionary<number[]>;

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {CoreGroup} from 'src/core/geometry/Group';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {Mesh, BufferGeometry} from 'three';
class ColorSopParamsConfig extends NodeParamsConfig {
	from_attribute = ParamConfig.BOOLEAN(0);
	attrib_name = ParamConfig.STRING('', {
		visible_if: {from_attribute: 1},
	});
	color = ParamConfig.COLOR([1, 1, 1], {
		visible_if: {from_attribute: 0},
		expression: {for_entities: true},
	});
	as_hsv = ParamConfig.BOOLEAN(0, {
		visible_if: {from_attribute: 0},
	});
}
const ParamsConfig = new ColorSopParamsConfig();

export class ColorSopNode extends TypedSopNode<ColorSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'color';
	}

	private _r_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _g_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _b_arrays_by_geometry_uuid: ValueArrayByName = {};

	static displayed_input_names(): string[] {
		return ['geometry to update color of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
		this.ui_data.set_icon('palette');
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const core_objects = core_group.core_objects();

		for (let core_object of core_objects) {
			if (this.pv.from_attribute) {
				this._set_from_attribute(core_object);
			} else {
				const has_expression = this.p.color.has_expression();
				if (has_expression) {
					await this._eval_expressions(core_object);
				} else {
					this._eval_simple_values(core_object);
				}
			}
		}

		// needs update required for when no cloning
		if (!this.io.inputs.input_cloned(0)) {
			const geometries = core_group.geometries();
			for (let geometry of geometries) {
				(geometry.getAttribute(COLOR_ATTRIB_NAME) as BufferAttribute).needsUpdate = true;
			}
		}

		this.set_core_group(core_group);
	}

	_set_from_attribute(core_object: CoreObject) {
		const core_geometry = core_object.core_geometry();
		this._create_init_color(core_geometry, DEFAULT_COLOR);
		const points = core_geometry.points();

		const src_attrib_size = core_geometry.attrib_size(this.pv.attrib_name);
		const geometry = core_geometry.geometry();
		const src_array = geometry.getAttribute(this.pv.attrib_name).array;
		const dest_array = geometry.getAttribute(COLOR_ATTRIB_NAME).array as number[];

		switch (src_attrib_size) {
			case 1: {
				for (let i = 0; i < points.length; i++) {
					const dest_i = i * 3;
					dest_array[dest_i + 0] = src_array[i];
					dest_array[dest_i + 1] = 1 - src_array[i];
					dest_array[dest_i + 2] = 0;
				}
				break;
			}
			case 2: {
				for (let i = 0; i < points.length; i++) {
					const dest_i = i * 3;
					const src_i = i * 2;
					dest_array[dest_i + 0] = src_array[src_i + 0];
					dest_array[dest_i + 1] = src_array[src_i + 1];
					dest_array[dest_i + 2] = 0;
				}
				break;
			}
			case 3: {
				for (let i = 0; i < src_array.length; i++) {
					dest_array[i] = src_array[i];
				}
				break;
			}
			case 4: {
				for (let i = 0; i < points.length; i++) {
					const dest_i = i * 3;
					const src_i = i * 4;
					dest_array[dest_i + 0] = src_array[src_i + 0];
					dest_array[dest_i + 1] = src_array[src_i + 1];
					dest_array[dest_i + 2] = src_array[src_i + 2];
				}
				break;
			}
		}
	}

	private _create_init_color(core_geometry: CoreGeometry, color: Color) {
		if (!core_geometry.has_attrib(COLOR_ATTRIB_NAME)) {
			core_geometry.add_numeric_attrib(COLOR_ATTRIB_NAME, 3, DEFAULT_COLOR);
		}
	}

	_eval_simple_values(core_object: CoreObject) {
		const core_geometry = core_object.core_geometry();
		this._create_init_color(core_geometry, DEFAULT_COLOR);

		let new_color: Color;
		if (this.pv.as_hsv) {
			new_color = new Color();
			CoreColor.set_hsv(this.pv.color.r, this.pv.color.g, this.pv.color.b, new_color);
		} else {
			new_color = this.pv.color; //.clone();
		}
		core_geometry.add_numeric_attrib(COLOR_ATTRIB_NAME, 3, new_color);
	}

	async _eval_expressions(core_object: CoreObject) {
		const points = core_object.points();
		const object = core_object.object();
		const core_geometry = core_object.core_geometry();
		this._create_init_color(core_geometry, DEFAULT_COLOR);
		const geometry = (object as Mesh).geometry as BufferGeometry;
		if (geometry) {
			const array = geometry.getAttribute(COLOR_ATTRIB_NAME).array as number[];

			const tmp_array_r = await this._update_from_param(geometry, array, points, 0);
			const tmp_array_g = await this._update_from_param(geometry, array, points, 1);
			const tmp_array_b = await this._update_from_param(geometry, array, points, 2);

			if (tmp_array_r) {
				this._commit_tmp_values(tmp_array_r, array, 0);
			}
			if (tmp_array_g) {
				this._commit_tmp_values(tmp_array_g, array, 1);
			}
			if (tmp_array_b) {
				this._commit_tmp_values(tmp_array_b, array, 2);
			}

			// to hsv
			if (this.pv.as_hsv) {
				let current = new Color();
				let target = new Color();
				let index;
				for (let point of points) {
					index = point.index * 3;
					current.fromArray(array, index);
					CoreColor.set_hsv(current.r, current.g, current.b, target);
					target.toArray(array, index);
				}
			}
		}

		// const colorr_param = this.param('colorr');
		// const colorg_param = this.param('colorg');
		// const colorb_param = this.param('colorb');

		// r
		// if(colorr_param.has_expression()){
		// 	await colorr_param.eval_expression_for_entities(points, (point, value)=>{
		// 		array[point.index()*3+0] = value
		// 	})
		// } else {
		// 	for(let point of points){
		// 		array[point.index()*3+0] = this.pv.color.r
		// 	}
		// }
		// g
		// if(colorg_param.has_expression()){
		// 	await colorg_param.eval_expression_for_entities(points, (point, value)=>{
		// 		array[point.index()*3+1] = value
		// 	})
		// } else {
		// 	for(let point of points){
		// 		array[point.index()*3+1] = this.pv.color.g
		// 	}
		// }
		// b
		// if(colorb_param.has_expression()){
		// 	await colorb_param.eval_expression_for_entities(points, (point, value)=>{
		// 		array[point.index()*3+2] = value
		// 	})
		// } else {
		// 	for(let point of points){
		// 		array[point.index()*3+2] = this.pv.color.b
		// 	}
		// }
	}

	private async _update_from_param(geometry: BufferGeometry, array: number[], points: CorePoint[], offset: number) {
		// const component_name = ['r', 'g', 'b'][offset];
		const param = this.p.color.components[offset];
		const param_value = [this.pv.color.r, this.pv.color.g, this.pv.color.b][offset];
		const arrays_by_geometry_uuid = [
			this._r_arrays_by_geometry_uuid,
			this._g_arrays_by_geometry_uuid,
			this._b_arrays_by_geometry_uuid,
		][offset];

		let tmp_array;
		if (param.has_expression()) {
			tmp_array = this._init_array_if_required(geometry, arrays_by_geometry_uuid, points.length);
			await param.expression_controller.compute_expression_for_entities(points, (point, value) => {
				// array[point.index()*3+2] = value
				tmp_array[point.index] = value;
			});
		} else {
			for (let point of points) {
				array[point.index * 3 + offset] = param_value;
			}
		}
		return tmp_array;
	}

	private _init_array_if_required(
		geometry: BufferGeometry,
		arrays_by_geometry_uuid: ValueArrayByName,
		points_count: number
	) {
		const uuid = geometry.uuid;
		const current_array = arrays_by_geometry_uuid[uuid];
		if (current_array) {
			// only create new array if we need more point, or as soon as the length is different?
			if (current_array.length < points_count) {
				arrays_by_geometry_uuid[uuid] = new Array(points_count);
			}
		} else {
			arrays_by_geometry_uuid[uuid] = new Array(points_count);
		}
		return arrays_by_geometry_uuid[uuid];
	}

	private _commit_tmp_values(tmp_array: number[], target_array: number[], offset: number) {
		for (let i = 0; i < tmp_array.length; i++) {
			target_array[i * 3 + offset] = tmp_array[i];
		}
	}
}
