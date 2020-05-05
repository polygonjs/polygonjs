import lodash_sortBy from 'lodash/sortBy';
// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
import {RGBFormat} from 'three/src/constants';
import {DataTexture} from 'three/src/textures/DataTexture';
import {CubicInterpolant} from 'three/src/math/interpolants/CubicInterpolant';
// import {ClampToEdgeWrapping} from 'three/src/constants'
// import {TypedParamVisitor} from './_Base';
import {TypedParam} from './_Base';
import {RampValue, RampPoint, RampValueJson, RampInterpolation} from './ramp/RampValue';

// import {AsCodeRamp} from './concerns/visitors/Ramp';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';

// interface RampParamVisitor extends TypedParamVisitor {
// 	visit_ramp_param: (param: RampParam) => any;
// }
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 1;
const TEXTURE_SIZE = TEXTURE_WIDTH * TEXTURE_HEIGHT;

export class RampParam extends TypedParam<ParamType.RAMP> {
	static type() {
		return ParamType.RAMP;
	}

	private _ramp_interpolant: CubicInterpolant | undefined;
	private _texture_data = new Uint8Array(3 * TEXTURE_SIZE);
	private _ramp_texture = new DataTexture(this._texture_data, TEXTURE_WIDTH, TEXTURE_HEIGHT, RGBFormat);

	static DEFAULT_VALUE = new RampValue(RampInterpolation.LINEAR, [new RampPoint(0, 0), new RampPoint(1, 1)]);
	static DEFAULT_VALUE_JSON: RampValueJson = RampParam.DEFAULT_VALUE.to_json();

	get default_value_serialized() {
		if (this.default_value instanceof RampValue) {
			return this.default_value.to_json();
		} else {
			return this.default_value;
		}
	}
	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.RAMP]) {
		if (raw_input instanceof RampValue) {
			return raw_input.clone();
		} else {
			return RampValue.from_json(raw_input).to_json();
		}
	}
	get raw_input_serialized() {
		if (this._raw_input instanceof RampValue) {
			return this._raw_input.to_json();
		} else {
			return RampValue.from_json(this._raw_input).to_json();
		}
	}
	get value_serialized() {
		return this.value.to_json();
	}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.RAMP],
		raw_input2: ParamInitValuesTypeMap[ParamType.RAMP]
	) {
		if (raw_input1 instanceof RampValue) {
			if (raw_input2 instanceof RampValue) {
				return raw_input1.is_equal(raw_input2);
			} else {
				return raw_input1.is_equal_json(raw_input2);
			}
		} else {
			if (raw_input2 instanceof RampValue) {
				return raw_input2.is_equal_json(raw_input1);
			} else {
				return RampValue.are_json_equal(raw_input1, raw_input2);
			}
		}
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.RAMP], val2: ParamValuesTypeMap[ParamType.RAMP]) {
		return val1.is_equal(val2);
	}
	initialize_param() {
		this.add_post_dirty_hook(
			'_reset_ramp_interpolant_and_texture',
			this.reset_ramp_interpolant_and_texture.bind(this)
		);
	}
	// accepts_visitor(visitor: RampParamVisitor) {
	// 	return visitor.visit_ramp_param(this);
	// }
	get is_default(): boolean {
		if (this.default_value instanceof RampValue) {
			return this.value.is_equal(this.default_value);
		} else {
			return this.value.is_equal_json(this.default_value);
		}
	}
	protected process_raw_input() {
		if (this._raw_input instanceof RampValue) {
			if (!this._value) {
				this._value = this._raw_input;
			} else {
				this._value.copy(this._raw_input);
			}
		} else {
			if (!this._value) {
				this._value = RampValue.from_json(this._raw_input);
			} else {
				this._value.from_json(this._raw_input);
			}
		}

		this._update_ramp_texture();
		this.options.execute_callback();
		this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
	}

	// convert_value(v) {
	// 	let is_json = false

	// 	if (lodash_isString(v)) {
	// 		v = JSON.parse(v)
	// 		is_json = true
	// 	}

	// 	if (!is_json) {
	// 		if (v.interpolation && v.points) {
	// 			if (lodash_isArray(v.points)) {
	// 				is_json = true
	// 			}
	// 		}
	// 	}
	// 	if (is_json) {
	// 		v = RampValue.from_json(v)
	// 	}

	// 	return v
	// }
	// convert_default_value(v) {
	// 	return this.convert_value(v)
	// }

	has_expression() {
		return false;
	}

	reset_ramp_interpolant_and_texture() {
		this._ramp_interpolant = undefined;
		// this._ramp_texture = undefined;
	}
	ramp_texture() {
		return this._ramp_texture;
	}
	private _update_ramp_texture() {
		this._update_ramp_texture_data();
		this.ramp_texture().needsUpdate = true;
	}
	private _update_ramp_texture_data() {
		let stride = 0;
		let position = 0;
		let value = 0;
		for (var i = 0; i < TEXTURE_SIZE; i++) {
			stride = i * 3;
			position = i / TEXTURE_WIDTH;
			value = this.value_at_position(position);
			this._texture_data[stride] = value * 255; // if I set 256, a value of 1 will become 0
			// data[ stride+1 ] = 1
			// data[ stride+2 ] = 2
		}
	}

	static create_interpolant(positions: Float32Array, values: Float32Array) {
		const values_count = 1;
		const interpolated_values = new Float32Array(values_count);
		return new CubicInterpolant(positions, values, values_count, interpolated_values);
	}
	interpolant() {
		return (this._ramp_interpolant = this._ramp_interpolant || this._create_interpolant());
	}
	_create_interpolant() {
		const points = this.value.points;
		const sorted_points = lodash_sortBy(points, (point) => point.position);
		const positions = new Float32Array(sorted_points.length);
		const values = new Float32Array(sorted_points.length);

		let i = 0;
		for (let sorted_point of sorted_points) {
			positions[i] = sorted_point.position;
			values[i] = sorted_point.value;
			i++;
		}

		return RampParam.create_interpolant(positions, values);
	}

	value_at_position(position: number): number {
		return (<unknown>this.interpolant().evaluate(position)[0]) as number;
	}
}
