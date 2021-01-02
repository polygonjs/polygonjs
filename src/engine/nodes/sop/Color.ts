/**
 * Set a vertex color attribute
 *
 * @remarks
 * Note that just like the attrib_create, it is possible to use an expression to set the attribute value
 *
 */
import {Color} from 'three/src/math/Color';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {CoreColor} from '../../../core/Color';
import {TypedSopNode} from './_Base';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';

const DEFAULT_COLOR = new Color(1, 1, 1);
const COLOR_ATTRIB_NAME = 'color';

type ValueArrayByName = PolyDictionary<number[]>;

import {ColorSopOperation} from '../../../core/operations/sop/Color';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PolyDictionary} from '../../../types/GlobalTypes';
const DEFAULT = ColorSopOperation.DEFAULT_PARAMS;
class ColorSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on if the color should be copied from another attribute */
	fromAttribute = ParamConfig.BOOLEAN(DEFAULT.fromAttribute);
	/** @param attribute name to copy value from */
	attribName = ParamConfig.STRING(DEFAULT.attribName, {
		visibleIf: {fromAttribute: 1},
	});
	/** @param color valu */
	color = ParamConfig.COLOR(DEFAULT.color, {
		visibleIf: {fromAttribute: 0},
		expression: {forEntities: true},
	});
	/** @param toggle on if the value should be set with hsv values rather than rgb */
	asHsv = ParamConfig.BOOLEAN(DEFAULT.asHsv, {
		visibleIf: {fromAttribute: 0},
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
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
		// this.uiData.set_icon('palette');
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const core_objects = core_group.coreObjects();

		for (let core_object of core_objects) {
			if (this.pv.fromAttribute) {
				this._set_fromAttribute(core_object);
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
		if (!this.io.inputs.clone_required(0)) {
			const geometries = core_group.geometries();
			for (let geometry of geometries) {
				(geometry.getAttribute(COLOR_ATTRIB_NAME) as BufferAttribute).needsUpdate = true;
			}
		}

		this.setCoreGroup(core_group);
	}

	_set_fromAttribute(core_object: CoreObject) {
		const core_geometry = core_object.coreGeometry();
		if (!core_geometry) {
			return;
		}
		this._create_init_color(core_geometry, DEFAULT_COLOR);
		const points = core_geometry.points();

		const src_attrib_size = core_geometry.attribSize(this.pv.attribName);
		const geometry = core_geometry.geometry();
		const src_array = geometry.getAttribute(this.pv.attribName).array;
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
		if (!core_geometry.hasAttrib(COLOR_ATTRIB_NAME)) {
			core_geometry.addNumericAttrib(COLOR_ATTRIB_NAME, 3, DEFAULT_COLOR);
		}
	}

	_eval_simple_values(core_object: CoreObject) {
		const core_geometry = core_object.coreGeometry();
		if (!core_geometry) {
			return;
		}
		this._create_init_color(core_geometry, DEFAULT_COLOR);

		let new_color: Color;
		if (this.pv.asHsv) {
			new_color = new Color();
			CoreColor.set_hsv(this.pv.color.r, this.pv.color.g, this.pv.color.b, new_color);
		} else {
			new_color = this.pv.color; //.clone();
		}
		core_geometry.addNumericAttrib(COLOR_ATTRIB_NAME, 3, new_color);
	}

	async _eval_expressions(core_object: CoreObject) {
		const points = core_object.points();
		const object = core_object.object();
		const core_geometry = core_object.coreGeometry();
		if (core_geometry) {
			this._create_init_color(core_geometry, DEFAULT_COLOR);
		}
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
			if (this.pv.asHsv) {
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

	private async _update_from_param(
		geometry: BufferGeometry,
		array: number[],
		points: CorePoint[],
		offset: number
	): Promise<number[] | undefined> {
		// const component_name = ['r', 'g', 'b'][offset];
		const param = this.p.color.components[offset];
		const param_value = [this.pv.color.r, this.pv.color.g, this.pv.color.b][offset];
		const arrays_by_geometry_uuid = [
			this._r_arrays_by_geometry_uuid,
			this._g_arrays_by_geometry_uuid,
			this._b_arrays_by_geometry_uuid,
		][offset];

		let tmp_array: number[] | undefined;
		if (param.has_expression() && param.expression_controller) {
			tmp_array = this._init_array_if_required(geometry, arrays_by_geometry_uuid, points.length);
			await param.expression_controller.compute_expression_for_points(points, (point, value) => {
				// array[point.index()*3+2] = value
				(tmp_array as number[])[point.index] = value;
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
