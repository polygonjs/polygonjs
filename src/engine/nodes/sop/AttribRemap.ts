/**
 * Remaps an attribute
 *
 * @remarks
 * This is very handy when you have an attribute with values between 0 and 1, and you want to remap those values with a ramp.
 *
 */
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribSize} from '../../../core/geometry/Constant';
import {TypeAssert} from '../../poly/Assert';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribRemapSopParamsConfig extends NodeParamsConfig {
	/** @param name of the attribute to remap */
	name = ParamConfig.STRING();
	/** @param ramp used to remap */
	ramp = ParamConfig.RAMP();
	/** @param toggle if you want to create a new attribute */
	change_name = ParamConfig.BOOLEAN(0);
	/** @param new attribute name */
	new_name = ParamConfig.STRING('', {visibleIf: {change_name: 1}});
}
const ParamsConfig = new AttribRemapSopParamsConfig();

export class AttribRemapSopNode extends TypedSopNode<AttribRemapSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribRemap';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		this._remap_attribute(core_group);
		this.set_core_group(core_group);
	}

	private _remap_attribute(core_group: CoreGroup) {
		const points = core_group.points();
		if (points.length === 0) {
			return;
		}
		if (this.pv.name === '') {
			return;
		}

		const attrib_size = points[0].attrib_size(this.pv.name);
		const values = points.map((point) => point.attrib_value(this.pv.name));
		// let min: NumericAttribValue, max: NumericAttribValue;
		let remaped_values: NumericAttribValue[] = new Array(points.length);
		this._get_remaped_values(attrib_size, values, remaped_values);

		let target_name = this.pv.name;
		if (this.pv.change_name) {
			target_name = this.pv.new_name;
			if (!core_group.has_attrib(target_name)) {
				core_group.add_numeric_vertex_attrib(target_name, attrib_size, 0);
			}
		}

		let i = 0;
		for (let normalized_value of remaped_values) {
			const point = points[i];
			point.set_attrib_value(target_name, normalized_value);
			i++;
		}
	}

	private _get_remaped_values(attrib_size: AttribSize, values: AttribValue[], remaped_values: NumericAttribValue[]) {
		switch (attrib_size) {
			case AttribSize.FLOAT:
				return this._get_normalized_float(values, remaped_values);
			case AttribSize.VECTOR2:
				return this._get_normalized_vector2(values, remaped_values);
			case AttribSize.VECTOR3:
				return this._get_normalized_vector3(values, remaped_values);
			case AttribSize.VECTOR4:
				return this._get_normalized_vector4(values, remaped_values);
		}
		TypeAssert.unreachable(attrib_size);
	}

	private _get_normalized_float(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesf = values as number[];

		const ramp_param = this.p.ramp;

		for (let i = 0; i < valuesf.length; i++) {
			const value = valuesf[i];
			const remaped_value = ramp_param.value_at_position(value);
			remaped_values[i] = remaped_value;
		}
	}
	private _get_normalized_vector2(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesv = values as Vector2[];
		const ramp_param = this.p.ramp;
		for (let i = 0; i < valuesv.length; i++) {
			const value = valuesv[i];
			const remaped_value = new Vector2(
				ramp_param.value_at_position(value.x),
				ramp_param.value_at_position(value.y)
			);
			remaped_values[i] = remaped_value;
		}
	}
	private _get_normalized_vector3(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesv = values as Vector3[];
		const ramp_param = this.p.ramp;
		for (let i = 0; i < valuesv.length; i++) {
			const value = valuesv[i];
			const remaped_value = new Vector3(
				ramp_param.value_at_position(value.x),
				ramp_param.value_at_position(value.y),
				ramp_param.value_at_position(value.z)
			);
			remaped_values[i] = remaped_value;
		}
	}
	private _get_normalized_vector4(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesv = values as Vector4[];
		const ramp_param = this.p.ramp;
		for (let i = 0; i < valuesv.length; i++) {
			const value = valuesv[i];
			const remaped_value = new Vector4(
				ramp_param.value_at_position(value.x),
				ramp_param.value_at_position(value.y),
				ramp_param.value_at_position(value.z),
				ramp_param.value_at_position(value.w)
			);
			remaped_values[i] = remaped_value;
		}
	}
}
