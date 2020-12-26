import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {ATTRIBUTE_CLASSES, AttribClass, AttribType, ATTRIBUTE_TYPES} from '../../geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../../engine/poly/Assert';
import {CoreObject} from '../../geometry/Object';
import {CoreAttribute} from '../../geometry/Attribute';

interface AttribCreateSopParams extends DefaultOperationParams {
	group: string;
	class: number;
	type: number;
	name: string;
	size: number;
	value1: number;
	value2: Vector2;
	value3: Vector3;
	value4: Vector4;
	string: string;
}

export class AttribCreateSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: AttribCreateSopParams = {
		group: '',
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		name: 'new_attrib',
		size: 1,
		value1: 0,
		value2: new Vector2(0, 0),
		value3: new Vector3(0, 0, 0),
		value4: new Vector4(0, 0, 0, 0),
		string: '',
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'attribCreate'> {
		return 'attribCreate';
	}

	cook(input_contents: CoreGroup[], params: AttribCreateSopParams) {
		const core_group = input_contents[0];
		if (params.name && params.name.trim() != '') {
			this._add_attribute(ATTRIBUTE_CLASSES[params.class], core_group, params);
		} else {
			this.states?.error.set('attribute name is not valid');
		}
		return core_group;
	}
	private async _add_attribute(attrib_class: AttribClass, core_group: CoreGroup, params: AttribCreateSopParams) {
		const attrib_type = ATTRIBUTE_TYPES[params.type];
		switch (attrib_class) {
			case AttribClass.VERTEX:
				await this.add_point_attribute(attrib_type, core_group, params);
				return;
			case AttribClass.OBJECT:
				await this.add_object_attribute(attrib_type, core_group, params);
				return;
		}
		TypeAssert.unreachable(attrib_class);
	}

	async add_point_attribute(attrib_type: AttribType, core_group: CoreGroup, params: AttribCreateSopParams) {
		const core_objects = core_group.core_objects();
		switch (attrib_type) {
			case AttribType.NUMERIC: {
				for (let i = 0; i < core_objects.length; i++) {
					await this.add_numeric_attribute_to_points(core_objects[i], params);
				}
				return;
			}
			case AttribType.STRING: {
				for (let i = 0; i < core_objects.length; i++) {
					await this.add_string_attribute_to_points(core_objects[i], params);
				}
				return;
			}
		}
		TypeAssert.unreachable(attrib_type);
	}
	async add_object_attribute(attrib_type: AttribType, core_group: CoreGroup, params: AttribCreateSopParams) {
		const core_objects = core_group.core_objects_from_group(params.group);
		switch (attrib_type) {
			case AttribType.NUMERIC:
				await this.add_numeric_attribute_to_object(core_objects, params);
				return;
			case AttribType.STRING:
				await this.add_string_attribute_to_object(core_objects, params);
				return;
		}
		TypeAssert.unreachable(attrib_type);
	}

	async add_numeric_attribute_to_points(core_object: CoreObject, params: AttribCreateSopParams) {
		const core_geometry = core_object.core_geometry();
		if (!core_geometry) {
			return;
		}

		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
		core_object.add_numeric_vertex_attrib(params.name, params.size, value);
	}

	async add_numeric_attribute_to_object(core_objects: CoreObject[], params: AttribCreateSopParams) {
		const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
		for (let core_object of core_objects) {
			core_object.set_attrib_value(params.name, value);
		}
	}

	async add_string_attribute_to_points(core_object: CoreObject, params: AttribCreateSopParams) {
		const points = core_object.points_from_group(params.group);
		const value = params.string;

		const string_values: string[] = new Array(points.length);

		for (let i = 0; i < points.length; i++) {
			string_values[i] = value;
		}

		const index_data = CoreAttribute.array_to_indexed_arrays(string_values);
		const geometry = core_object.core_geometry();
		if (geometry) {
			geometry.set_indexed_attribute(params.name, index_data['values'], index_data['indices']);
		}
	}

	async add_string_attribute_to_object(core_objects: CoreObject[], params: AttribCreateSopParams) {
		const value = params.string;
		for (let core_object of core_objects) {
			core_object.set_attrib_value(params.name, value);
		}
	}
}
