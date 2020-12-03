import lodash_trim from 'lodash/trim';

import {TypedSopNode} from './_Base';
import {
	AttribClassMenuEntries,
	AttribTypeMenuEntries,
	AttribClass,
	AttribType,
	ATTRIBUTE_CLASSES,
	ATTRIBUTE_TYPES,
} from '../../../core/geometry/Constant';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypeAssert} from '../../poly/Assert';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

type ValueArrayByName = Dictionary<number[]>;

import {AttribCreateSopOperation} from '../../../core/operations/sop/AttribCreate';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribCreateSopOperation.DEFAULT_PARAMS;
class AttribCreateSopParamsConfig extends NodeParamsConfig {
	group = ParamConfig.STRING(DEFAULT.group);
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	type = ParamConfig.INTEGER(DEFAULT.type, {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	name = ParamConfig.STRING(DEFAULT.name);
	size = ParamConfig.INTEGER(DEFAULT.size, {
		range: [1, 4],
		range_locked: [true, true],
		visible_if: {type: AttribType.NUMERIC},
	});
	value1 = ParamConfig.FLOAT(DEFAULT.value1, {
		visible_if: {type: AttribType.NUMERIC, size: 1},
		expression: {for_entities: true},
	});
	value2 = ParamConfig.VECTOR2(DEFAULT.value2, {
		visible_if: {type: AttribType.NUMERIC, size: 2},
		expression: {for_entities: true},
	});
	value3 = ParamConfig.VECTOR3(DEFAULT.value3, {
		visible_if: {type: AttribType.NUMERIC, size: 3},
		expression: {for_entities: true},
	});
	value4 = ParamConfig.VECTOR4(DEFAULT.value4, {
		visible_if: {type: AttribType.NUMERIC, size: 4},
		expression: {for_entities: true},
	});
	string = ParamConfig.STRING(DEFAULT.string, {
		visible_if: {type: AttribType.STRING},
		expression: {for_entities: true},
	});
}
const ParamsConfig = new AttribCreateSopParamsConfig();
export class AttribCreateSopNode extends TypedSopNode<AttribCreateSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_create';
	}

	private _x_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _y_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _z_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _w_arrays_by_geometry_uuid: ValueArrayByName = {};

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(AttribCreateSopOperation.INPUT_CLONED_STATE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	private _operation: AttribCreateSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		// cannot yet convert to an operation, as expressions may be used in this node
		// but we can still use one when no expression is required

		if (this._is_using_expression()) {
			if (this.pv.name && lodash_trim(this.pv.name) != '') {
				this._add_attribute(ATTRIBUTE_CLASSES[this.pv.class], input_contents[0]);
			} else {
				this.states.error.set('attribute name is not valid');
			}
		} else {
			this._operation = this._operation || new AttribCreateSopOperation(this.scene, this.states);
			const core_group = this._operation.cook(input_contents, this.pv);
			this.set_core_group(core_group);
		}
	}
	private async _add_attribute(attrib_class: AttribClass, core_group: CoreGroup) {
		const attrib_type = ATTRIBUTE_TYPES[this.pv.type];
		switch (attrib_class) {
			case AttribClass.VERTEX:
				await this.add_point_attribute(attrib_type, core_group);
				return this.set_core_group(core_group);
			case AttribClass.OBJECT:
				await this.add_object_attribute(attrib_type, core_group);
				return this.set_core_group(core_group);
		}
		TypeAssert.unreachable(attrib_class);
	}

	async add_point_attribute(attrib_type: AttribType, core_group: CoreGroup) {
		const core_objects = core_group.core_objects();
		switch (attrib_type) {
			case AttribType.NUMERIC: {
				for (let i = 0; i < core_objects.length; i++) {
					await this.add_numeric_attribute_to_points(core_objects[i]);
				}
				return;
			}
			case AttribType.STRING: {
				for (let i = 0; i < core_objects.length; i++) {
					await this.add_string_attribute_to_points(core_objects[i]);
				}
				return;
			}
		}
		TypeAssert.unreachable(attrib_type);
	}
	async add_object_attribute(attrib_type: AttribType, core_group: CoreGroup) {
		const core_objects = core_group.core_objects_from_group(this.pv.group);
		switch (attrib_type) {
			case AttribType.NUMERIC:
				await this.add_numeric_attribute_to_object(core_objects);
				return;
			case AttribType.STRING:
				await this.add_string_attribute_to_object(core_objects);
				return;
		}
		TypeAssert.unreachable(attrib_type);
	}

	async add_numeric_attribute_to_points(core_object: CoreObject) {
		const core_geometry = core_object.core_geometry();
		if (!core_geometry) {
			return;
		}
		const points = core_object.points_from_group(this.pv.group);

		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];

		if (param.has_expression()) {
			if (!core_geometry.has_attrib(this.pv.name)) {
				core_geometry.add_numeric_attrib(this.pv.name, this.pv.size, param.value);
			}

			const geometry = core_geometry.geometry();
			const array = geometry.getAttribute(this.pv.name).array as number[];
			if (this.pv.size == 1) {
				if (this.p.value1.expression_controller) {
					await this.p.value1.expression_controller.compute_expression_for_points(points, (point, value) => {
						array[point.index * this.pv.size + 0] = value;
					});
				}
			} else {
				const vparam = [this.p.value2, this.p.value3, this.p.value4][this.pv.size - 2];
				let params = vparam.components;
				const tmp_arrays = new Array(params.length);
				let component_param;

				const arrays_by_geometry_uuid = [
					this._x_arrays_by_geometry_uuid,
					this._y_arrays_by_geometry_uuid,
					this._z_arrays_by_geometry_uuid,
					this._w_arrays_by_geometry_uuid,
				];

				for (let i = 0; i < params.length; i++) {
					component_param = params[i];
					if (component_param.has_expression() && component_param.expression_controller) {
						tmp_arrays[i] = this._init_array_if_required(
							geometry,
							arrays_by_geometry_uuid[i],
							points.length
						);
						await component_param.expression_controller.compute_expression_for_points(
							points,
							(point, value) => {
								// array[point.index()*this.pv.size+i] = value
								tmp_arrays[i][point.index] = value;
							}
						);
					} else {
						const value = component_param.value;
						for (let point of points) {
							array[point.index * this.pv.size + i] = value;
						}
					}
				}
				// commit the tmp values
				for (let j = 0; j < tmp_arrays.length; j++) {
					const tmp_array = tmp_arrays[j];
					if (tmp_array) {
						for (let i = 0; i < tmp_array.length; i++) {
							array[i * this.pv.size + j] = tmp_array[i];
						}
					}
				}
			}
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}

	async add_numeric_attribute_to_object(core_objects: CoreObject[]) {
		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
		if (param.has_expression()) {
			if (this.pv.size == 1) {
				if (this.p.value1.expression_controller) {
					await this.p.value1.expression_controller.compute_expression_for_objects(
						core_objects,
						(core_object, value) => {
							core_object.set_attrib_value(this.pv.name, value);
						}
					);
				}
			} else {
				const vparam = [this.p.value2, this.p.value3, this.p.value4][this.pv.size - 2];
				let params = vparam.components;
				let values_by_core_object_index: Dictionary<NumericAttribValueAsArray> = {};
				// for (let component_param of params) {
				// 	values.push(component_param.value);
				// }
				for (let core_object of core_objects) {
					values_by_core_object_index[core_object.index] = (<unknown>[]) as NumericAttribValueAsArray;
				}
				for (let component_index = 0; component_index < params.length; component_index++) {
					const component_param = params[component_index];
					if (component_param.has_expression() && component_param.expression_controller) {
						await component_param.expression_controller.compute_expression_for_objects(
							core_objects,
							(core_object, value) => {
								values_by_core_object_index[core_object.index][component_index] = value;
							}
						);
					} else {
						for (let core_object of core_objects) {
							values_by_core_object_index[core_object.index][component_index] = component_param.value;
						}
					}
				}
				for (let i = 0; i < core_objects.length; i++) {
					const core_object = core_objects[i];
					const value = values_by_core_object_index[core_object.index];
					core_object.set_attrib_value(this.pv.name, value);
				}
			}
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}

	// private _convert_object_numeric_value(value: Vector4) {
	// 	let converted_value;
	// 	switch (this.pv.size) {
	// 		case 1: {
	// 			converted_value = value.x;
	// 			break;
	// 		}
	// 		case 2: {
	// 			converted_value = new Vector2(value.x, value.y);
	// 			break;
	// 		}
	// 		case 3: {
	// 			converted_value = new Vector3(value.x, value.y, value.z);
	// 			break;
	// 		}
	// 		case 4: {
	// 			converted_value = new Vector4(value.x, value.y, value.z, value.w);
	// 			break;
	// 		}
	// 	}
	// 	return converted_value;
	// }

	async add_string_attribute_to_points(core_object: CoreObject) {
		const points = core_object.points_from_group(this.pv.group);
		const param = this.p.string;

		const string_values: string[] = new Array(points.length);
		if (param.has_expression() && param.expression_controller) {
			await param.expression_controller.compute_expression_for_points(points, (point, value) => {
				string_values[point.index] = value;
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}

		const index_data = CoreAttribute.array_to_indexed_arrays(string_values);
		const geometry = core_object.core_geometry();
		if (geometry) {
			geometry.set_indexed_attribute(this.pv.name, index_data['values'], index_data['indices']);
		}
	}

	async add_string_attribute_to_object(core_objects: CoreObject[]) {
		const param = this.p.string;
		if (param.has_expression() && param.expression_controller) {
			await param.expression_controller.compute_expression_for_objects(core_objects, (core_object, value) => {
				core_object.set_attrib_value(this.pv.name, value);
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}
		// this.context().set_entity(object);

		// const core_object = new CoreObject(object);

		// this.param('string').eval(val => {
		// 	core_object.add_attribute(this.pv.name, val);
		// });
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

	//
	//
	// CHECK IF EXPRESSION IS BEING USED, TO ALLOW EASY SWITCH TO OPERATION
	//
	//
	private _is_using_expression(): boolean {
		const attrib_type = ATTRIBUTE_TYPES[this.pv.type];
		switch (attrib_type) {
			case AttribType.NUMERIC:
				const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
				return param.has_expression();
			case AttribType.STRING:
				return this.p.string.has_expression();
		}
	}
}
