import lodash_trim from 'lodash/trim';

import {TypedSopNode} from './_Base';
import {CoreConstant} from 'src/core/geometry/Constant';
import {CoreAttribute} from 'src/core/geometry/Attribute';
// import {CoreGeometry} from 'src/core/geometry/Geometry'
import {CoreObject} from 'src/core/geometry/Object';
import {CoreGroup} from 'src/core/geometry/Group';

// import {Vector3} from 'three/src/math/Vector3';
// import {Vector2} from 'three/src/math/Vector2';
import {Group} from 'three/src/objects/Group';

import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

// const VALUE_PARAM = {
// 	VALUEX: 'valuex',
// 	VALUE: 'value',
// 	STRING: 'string',
// };
// const DEFAULT_VALUE = {
// 	valuex: 0,
// 	value: [0, 0, 0],
// 	string: '',
// };
type COMPONENT_INDEX = keyof Vector4Like;
const COMPONENT_INDEX: Array<COMPONENT_INDEX> = ['x', 'y', 'z', 'w'];
type ValueArrayByName = Dictionary<number[]>;

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class AttribCreateSopParamsConfig extends NodeParamsConfig {
	group = ParamConfig.STRING('');
	class = ParamConfig.INTEGER(CoreConstant.ATTRIB_CLASS.VERTEX, {
		menu: {
			entries: Object.keys(CoreConstant.ATTRIB_CLASS).map((type, i) => {
				return {
					name: type,
					value: CoreConstant.ATTRIB_CLASS[name],
				};
			}),
		},
	});
	type = ParamConfig.INTEGER(CoreConstant.ATTRIB_TYPE.NUMERIC, {
		menu: {
			entries: [
				{name: 'numeric', value: CoreConstant.ATTRIB_TYPE.NUMERIC},
				{name: 'string', value: CoreConstant.ATTRIB_TYPE.STRING},
			],
		},
	});
	name = ParamConfig.STRING('new_attrib');
	size = ParamConfig.INTEGER(1, {
		range: [1, 4],
		range_locked: [true, true],
		visible_if: {type: CoreConstant.ATTRIB_TYPE.NUMERIC},
	});
	value1 = ParamConfig.FLOAT(0, {
		visible_if: {type: CoreConstant.ATTRIB_TYPE.NUMERIC, size: 1},
		expression: {for_entities: true},
	});
	value2 = ParamConfig.VECTOR2([0, 0], {
		visible_if: {type: CoreConstant.ATTRIB_TYPE.NUMERIC, size: 2},
		expression: {for_entities: true},
	});
	value3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {type: CoreConstant.ATTRIB_TYPE.NUMERIC, size: 3},
		expression: {for_entities: true},
	});
	value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visible_if: {type: CoreConstant.ATTRIB_TYPE.NUMERIC, size: 4},
		expression: {for_entities: true},
	});
	string = ParamConfig.STRING('', {
		visible_if: {type: CoreConstant.ATTRIB_TYPE.STRING},
		expression: {for_entities: true},
	});
}
const ParamsConfig = new AttribCreateSopParamsConfig();
export class AttribCreateSopNode extends TypedSopNode<AttribCreateSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_create';
	}

	_group: Group;

	private _x_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _y_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _z_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _w_arrays_by_geometry_uuid: ValueArrayByName = {};

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		if (this.pv.name && lodash_trim(this.pv.name) != '') {
			switch (this.pv.class) {
				case CoreConstant.ATTRIB_CLASS.VERTEX:
					this.add_point_attribute(core_group);
				case CoreConstant.ATTRIB_CLASS.OBJECT:
					this.add_object_attribute(core_group);
			}
		} else {
			this.states.error.set('attribute name is not valid');
		}
	}

	async add_point_attribute(core_group: CoreGroup) {
		const core_objects = core_group.core_objects();
		for (let i = 0; i < core_objects.length; i++) {
			const core_object = core_objects[i];
			switch (this.pv.type) {
				case CoreConstant.ATTRIB_TYPE.NUMERIC:
					await this.add_numeric_attribute_to_points(core_object);
					break;
				case CoreConstant.ATTRIB_TYPE.STRING:
					await this.add_string_attribute_to_points(core_object);
					break;
			}
		}
		this.set_core_group(core_group);
	}
	async add_object_attribute(core_group: CoreGroup) {
		const core_objects = core_group.core_objects_from_group(this.pv.group);
		switch (this.pv.type) {
			case CoreConstant.ATTRIB_TYPE.NUMERIC:
				await this.add_numeric_attribute_to_object(core_objects);
				break;
			case CoreConstant.ATTRIB_TYPE.STRING:
				await this.add_string_attribute_to_object(core_objects);
				break;
		}
		this.set_core_group(core_group);
	}

	async add_numeric_attribute_to_points(core_object: CoreObject) {
		const core_geometry = core_object.core_geometry();
		const points = core_object.points_from_group(this.pv.group);

		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];

		if (param.has_expression()) {
			if (!core_geometry.has_attrib(this.pv.name)) {
				core_geometry.add_numeric_attrib(this.pv.name, this.pv.size, param.value);
			}

			const geometry = core_geometry.geometry();
			const array = geometry.getAttribute(this.pv.name).array as number[];
			if (this.pv.size == 1) {
				await this.p.value1.expression_controller.compute_expression_for_entities(points, (point, value) => {
					array[point.index * this.pv.size + 0] = value;
				});
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
					if (component_param.has_expression()) {
						tmp_arrays[i] = this._init_array_if_required(
							geometry,
							arrays_by_geometry_uuid[i],
							points.length
						);
						await component_param.expression_controller.compute_expression_for_entities(
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
			// const value = await param.eval_p();
			core_object.add_numeric_vertex_attrib(this.pv.name, this.pv.size, param.value);
		}
	}

	async add_numeric_attribute_to_object(core_objects: CoreObject[]) {
		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];
		if (param.has_expression()) {
			if (this.pv.size == 1) {
				await this.p.value1.expression_controller.compute_expression_for_entities(
					core_objects,
					(core_object, value) => {
						core_object.set_attrib_value(this.pv.name, value);
					}
				);
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
					if (component_param.has_expression()) {
						await component_param.expression_controller.compute_expression_for_entities(
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
			// let value = await param.eval_p();
			// if (this.pv.size > 1) {
			// 	value = this._convert_object_numeric_value(value);
			// }
			for (let core_object of core_objects) {
				core_object.set_attrib_value(this.pv.name, param.value);
			}
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

		const string_values: string[] = [];
		if (param.has_expression()) {
			await param.expression_controller.compute_expression_for_entities(points, (point, value) => {
				string_values[point.index] = value;
			});
		} else {
			string_values.push(param.value);
		}

		const index_data = CoreAttribute.array_to_indexed_arrays(string_values);
		core_object.core_geometry().set_indexed_attribute(this.pv.name, index_data['values'], index_data['indices']);
	}

	async add_string_attribute_to_object(core_objects: CoreObject[]) {
		const param = this.p.string;
		if (param.has_expression()) {
			await param.expression_controller.compute_expression_for_entities(core_objects, (core_object, value) => {
				core_object.set_attrib_value(this.pv.name, value);
			});
		} else {
			for (let core_object of core_objects) {
				core_object.set_attrib_value(this.pv.name, param.value);
			}
		}
		// this.context().set_entity(object);

		// const core_object = new CoreObject(object);

		// this.param('string').eval(val => {
		// 	core_object.add_attribute(this.pv.name, val);
		// });
	}

	//
	//
	// PRIVATE
	//
	//

	// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
	// async _eval_params_for_entities(entities){
	// 	// let p = Promise.resolve(); // Q() in q

	// 	const param = this._value_param();

	// 	if (param.has_expression()) {
	// 		// const iterator = new CoreIterator()
	// 		// await iterator.start_with_array(entities, (element, index)=>{

	// 		// })
	// 		for(let entity of entities){
	// 			await this._eval_param_for_entity(param, entity);
	// 		}

	// 		// entities.forEach((entity, index)=> {
	// 		// 	p = p.then(() => {
	// 		// 		return this._eval_param_for_entity(param, entity);
	// 		// 	});
	// 		// });
	// 	} else {
	// 		const val = await param.eval_p();
	// 		for(let entity of entities){
	// 			this._values.push(val);
	// 		}
	// 		// entities.forEach(entity=> {
	// 		// 	return this._values.push(val);
	// 		// });
	// 	}

	// 	// return p;
	// }

	// async _eval_param_for_entity(value_param, entity){
	// 	this.context().set_entity(entity);

	// 	let val = await value_param.eval_p()

	// 	 // TODO: optimize. pass directly to the entity instead
	// 	if(val.clone){
	// 		val = val.clone()
	// 	}
	// 	this._values.push(val);
	// }

	// private _default_attrib_value() {
	// 	return DEFAULT_VALUE[this._value_param_name()];
	// }

	// private _value_param_name() {
	// 	if (this.pv.type == CoreConstant.ATTRIB_TYPE.NUMERIC) {
	// 		if (this.pv.size == 1) {
	// 			return VALUE_PARAM.VALUEX;
	// 		} else {
	// 			return VALUE_PARAM.VALUE;
	// 		}
	// 	} else {
	// 		return VALUE_PARAM.STRING;
	// 	}
	// }
	// private _value_param() {
	// 	return this.params.get(this._value_param_name());
	// }

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

	// private _commit_tmp_values(tmp_array: number[], target_array: number[], offset: number) {
	// 	for (let i = 0; i < tmp_array.length; i++) {
	// 		target_array[i * 3 + offset] = tmp_array[i];
	// 	}
	// }
}
