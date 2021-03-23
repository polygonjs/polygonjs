/**
 * Creates an attribute on the geometry or object.
 *
 * @remarks
 * This allows you to create an attribute and define the following:
 * - the group this applies to
 * - the name
 * - the type (numeric or string)
 * - the size (float, vector2, vector3 or vector4)
 * - the class (geometry or object attribute)
 * - the value
 *
 * Note that you can also given an expression to set the value of the attribute, such as `sin(2*@P.z)`
 *
 */
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
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

type VectorComponent = 'x' | 'y' | 'z' | 'w';
const COMPONENT_NAMES: Array<VectorComponent> = ['x', 'y', 'z', 'w'];

type ValueArrayByName = PolyDictionary<number[]>;

import {AttribCreateSopOperation} from '../../operations/sop/AttribCreate';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribCreateSopOperation.DEFAULT_PARAMS;
class AttribCreateSopParamsConfig extends NodeParamsConfig {
	/** @param the group this applies to */
	group = ParamConfig.STRING(DEFAULT.group);
	/** @param the attribute class (geometry or object) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param the attribute type (numeric or string) */
	type = ParamConfig.INTEGER(DEFAULT.type, {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	/** @param the attribute name */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param the attribute size (1 for float, 2 for vector2, 3 for vector3, 4 for vector4) */
	size = ParamConfig.INTEGER(DEFAULT.size, {
		range: [1, 4],
		rangeLocked: [true, true],
		visibleIf: {type: AttribType.NUMERIC},
	});
	/** @param the value for a float attribute */
	value1 = ParamConfig.FLOAT(DEFAULT.value1, {
		visibleIf: {type: AttribType.NUMERIC, size: 1},
		expression: {forEntities: true},
	});
	/** @param the value for a vector2 */
	value2 = ParamConfig.VECTOR2(DEFAULT.value2, {
		visibleIf: {type: AttribType.NUMERIC, size: 2},
		expression: {forEntities: true},
	});
	/** @param the value for a vector3 */
	value3 = ParamConfig.VECTOR3(DEFAULT.value3, {
		visibleIf: {type: AttribType.NUMERIC, size: 3},
		expression: {forEntities: true},
	});
	/** @param the value for a vector4 */
	value4 = ParamConfig.VECTOR4(DEFAULT.value4, {
		visibleIf: {type: AttribType.NUMERIC, size: 4},
		expression: {forEntities: true},
	});
	/** @param the value for a string attribute */
	string = ParamConfig.STRING(DEFAULT.string, {
		visibleIf: {type: AttribType.STRING},
		expression: {forEntities: true},
	});
}
const ParamsConfig = new AttribCreateSopParamsConfig();
export class AttribCreateSopNode extends TypedSopNode<AttribCreateSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribCreate';
	}

	private _x_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _y_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _z_arrays_by_geometry_uuid: ValueArrayByName = {};
	private _w_arrays_by_geometry_uuid: ValueArrayByName = {};

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribCreateSopOperation.INPUT_CLONED_STATE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	private _operation: AttribCreateSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		// cannot yet convert to an operation, as expressions may be used in this node
		// but we can still use one when no expression is required

		if (this._is_using_expression()) {
			if (this.pv.name && this.pv.name.trim() != '') {
				this._add_attribute(ATTRIBUTE_CLASSES[this.pv.class], input_contents[0]);
			} else {
				this.states.error.set('attribute name is not valid');
			}
		} else {
			this._operation = this._operation || new AttribCreateSopOperation(this.scene(), this.states);
			const core_group = this._operation.cook(input_contents, this.pv);
			this.setCoreGroup(core_group);
		}
	}
	private async _add_attribute(attrib_class: AttribClass, core_group: CoreGroup) {
		const attrib_type = ATTRIBUTE_TYPES[this.pv.type];
		switch (attrib_class) {
			case AttribClass.VERTEX:
				await this.add_point_attribute(attrib_type, core_group);
				return this.setCoreGroup(core_group);
			case AttribClass.OBJECT:
				await this.add_object_attribute(attrib_type, core_group);
				return this.setCoreGroup(core_group);
		}
		TypeAssert.unreachable(attrib_class);
	}

	async add_point_attribute(attrib_type: AttribType, core_group: CoreGroup) {
		const core_objects = core_group.coreObjects();
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
		const core_objects = core_group.coreObjectsFromGroup(this.pv.group);
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
		const core_geometry = core_object.coreGeometry();
		if (!core_geometry) {
			return;
		}
		const points = core_object.pointsFromGroup(this.pv.group);

		const param = [this.p.value1, this.p.value2, this.p.value3, this.p.value4][this.pv.size - 1];

		if (param.hasExpression()) {
			if (!core_geometry.hasAttrib(this.pv.name)) {
				core_geometry.addNumericAttrib(this.pv.name, this.pv.size, param.value);
			}

			const geometry = core_geometry.geometry();
			const array = geometry.getAttribute(this.pv.name).array as number[];
			if (this.pv.size == 1) {
				if (this.p.value1.expressionController) {
					await this.p.value1.expressionController.compute_expression_for_points(points, (point, value) => {
						array[point.index() * this.pv.size + 0] = value;
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
					if (component_param.hasExpression() && component_param.expressionController) {
						tmp_arrays[i] = this._init_array_if_required(
							geometry,
							arrays_by_geometry_uuid[i],
							points.length
						);
						await component_param.expressionController.compute_expression_for_points(
							points,
							(point, value) => {
								// array[point.index()*this.pv.size+i] = value
								tmp_arrays[i][point.index()] = value;
							}
						);
					} else {
						const value = component_param.value;
						for (let point of points) {
							array[point.index() * this.pv.size + i] = value;
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
		if (param.hasExpression()) {
			if (this.pv.size == 1) {
				if (this.p.value1.expressionController) {
					await this.p.value1.expressionController.compute_expression_for_objects(
						core_objects,
						(core_object, value) => {
							core_object.setAttribValue(this.pv.name, value);
						}
					);
				}
			} else {
				const vparam = [this.p.value2, this.p.value3, this.p.value4][this.pv.size - 2];
				let params = vparam.components;
				let values_by_core_object_index: PolyDictionary<Vector2 | Vector3 | Vector4> = {};
				// for (let component_param of params) {
				// 	values.push(component_param.value);
				// }
				const init_vector = this._vector_by_attrib_size(this.pv.size);
				if (init_vector) {
					for (let core_object of core_objects) {
						values_by_core_object_index[core_object.index()] = init_vector;
					}
					for (let component_index = 0; component_index < params.length; component_index++) {
						const component_param = params[component_index];
						const component_name = COMPONENT_NAMES[component_index];
						if (component_param.hasExpression() && component_param.expressionController) {
							await component_param.expressionController.compute_expression_for_objects(
								core_objects,
								(core_object, value) => {
									const vector = values_by_core_object_index[core_object.index()] as Vector4;
									vector[component_name] = value;
								}
							);
						} else {
							for (let core_object of core_objects) {
								const vector = values_by_core_object_index[core_object.index()] as Vector4;
								vector[component_name] = component_param.value;
							}
						}
					}
					for (let i = 0; i < core_objects.length; i++) {
						const core_object = core_objects[i];
						const value = values_by_core_object_index[core_object.index()];
						core_object.setAttribValue(this.pv.name, value);
					}
				}
			}
		} else {
			// no need to do work here, as this will be done in the operation
		}
	}
	private _vector_by_attrib_size(size: number) {
		switch (size) {
			case 2:
				return new Vector2(0, 0);
			case 3:
				return new Vector3(0, 0, 0);
			case 4:
				return new Vector4(0, 0, 0, 0);
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
		const points = core_object.pointsFromGroup(this.pv.group);
		const param = this.p.string;

		const string_values: string[] = new Array(points.length);
		if (param.hasExpression() && param.expressionController) {
			await param.expressionController.compute_expression_for_points(points, (point, value) => {
				string_values[point.index()] = value;
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}

		const index_data = CoreAttribute.arrayToIndexedArrays(string_values);
		const geometry = core_object.coreGeometry();
		if (geometry) {
			geometry.setIndexedAttribute(this.pv.name, index_data['values'], index_data['indices']);
		}
	}

	async add_string_attribute_to_object(core_objects: CoreObject[]) {
		const param = this.p.string;
		if (param.hasExpression() && param.expressionController) {
			await param.expressionController.compute_expression_for_objects(core_objects, (core_object, value) => {
				core_object.setAttribValue(this.pv.name, value);
			});
		} else {
			// no need to do work here, as this will be done in the operation
		}
		// this.context().set_entity(object);

		// const core_object = new CoreObject(object);

		// this.param('string').eval(val => {
		// 	core_object.addAttribute(this.pv.name, val);
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
				return param.hasExpression();
			case AttribType.STRING:
				return this.p.string.hasExpression();
		}
	}

	//
	//
	// API UTILS
	//
	//
	setType(type: AttribType) {
		this.p.type.set(ATTRIBUTE_TYPES.indexOf(type));
	}
}
