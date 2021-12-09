import {RGBFormat} from 'three/src/constants';
import {DataTexture} from 'three/src/textures/DataTexture';
import {CubicInterpolant} from 'three/src/math/interpolants/CubicInterpolant';
import {TypedParam} from './_Base';
import {RampValue, RampPoint, RampValueJson, RampInterpolation} from './ramp/RampValue';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';
import {ArrayUtils} from '../../core/ArrayUtils';
import {clamp} from 'three/src/math/MathUtils';

const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 1;
const TEXTURE_SIZE = TEXTURE_WIDTH * TEXTURE_HEIGHT;
const TEXTURE_BYTES_MULT = 255;

export class RampParam extends TypedParam<ParamType.RAMP> {
	static type() {
		return ParamType.RAMP;
	}

	private _ramp_interpolant: CubicInterpolant | undefined;
	private _texture_data = new Uint8Array(3 * TEXTURE_SIZE);
	private _ramp_texture = new DataTexture(this._texture_data, TEXTURE_WIDTH, TEXTURE_HEIGHT, RGBFormat);

	static DEFAULT_VALUE = new RampValue(RampInterpolation.CUBIC, [new RampPoint(0, 0), new RampPoint(1, 1)]);
	static DEFAULT_VALUE_JSON: RampValueJson = RampParam.DEFAULT_VALUE.toJSON();

	defaultValueSerialized() {
		if (this._default_value instanceof RampValue) {
			return this._default_value.toJSON();
		} else {
			return this._default_value;
		}
	}
	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.RAMP]) {
		if (raw_input instanceof RampValue) {
			return raw_input.clone();
		} else {
			return RampValue.fromJSON(raw_input).toJSON();
		}
	}
	rawInputSerialized() {
		if (this._raw_input instanceof RampValue) {
			return this._raw_input.toJSON();
		} else {
			return RampValue.fromJSON(this._raw_input).toJSON();
		}
	}
	valueSerialized() {
		return this.value.toJSON();
	}
	protected _copy_value(param: RampParam) {
		this.set(param.valueSerialized());
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
	// initialize_param() {
	// 	this.addPostDirtyHook(
	// 		'_reset_ramp_interpolant_and_texture',
	// 		this.reset_ramp_interpolant.bind(this)
	// 	);
	// }
	// accepts_visitor(visitor: RampParamVisitor) {
	// 	return visitor.visit_ramp_param(this);
	// }
	isDefault(): boolean {
		if (this._default_value instanceof RampValue) {
			return this.value.is_equal(this._default_value);
		} else {
			return this.value.is_equal_json(this._default_value);
		}
	}
	protected processRawInput() {
		if (this._raw_input instanceof RampValue) {
			if (!this._value) {
				this._value = this._raw_input;
			} else {
				this._value.copy(this._raw_input);
			}
		} else {
			if (!this._value) {
				this._value = RampValue.fromJSON(this._raw_input);
			} else {
				this._value.from_json(this._raw_input);
			}
		}

		this._resetRampInterpolant();
		this._updateRampTexture();
		this.options.executeCallback();
		this.emitController.emit(ParamEvent.VALUE_UPDATED);
		this.setSuccessorsDirty(this);
	}

	// convert_value(v) {
	// 	let is_json = false

	// 	if (CoreType.isString(v)) {
	// 		v = JSON.parse(v)
	// 		is_json = true
	// 	}

	// 	if (!is_json) {
	// 		if (v.interpolation && v.points) {
	// 			if (CoreType.isArray(v.points)) {
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

	hasExpression() {
		return false;
	}

	private _resetRampInterpolant() {
		this._ramp_interpolant = undefined;
		// this._ramp_texture = undefined;
	}
	rampTexture() {
		return this._ramp_texture;
	}
	private _updateRampTexture() {
		this._updateRampTextureData();
		this.rampTexture().needsUpdate = true;
	}
	private _updateRampTextureData() {
		let stride = 0;
		let position = 0;
		let value = 0;
		// we set the bounds at [-1:2]
		// so that we can have the ramp go 1 unit below and above the range [0:1]
		// so -1 becomes R=0, G=0, B=0
		// so -0.5 becomes R=0.5, G=0, B=0
		// so 0 becomes R=1, G=0, B=0
		// so 0.5 becomes R=1, G=0.5, B=0
		// so 1 becomes R=1, G=1, B=0
		// so 1.5 becomes R=1, G=1, B=0.5
		// so 2 becomes R=1, G=1, B=1
		for (var i = 0; i < TEXTURE_SIZE; i++) {
			stride = i * 3;
			position = i / TEXTURE_WIDTH;
			value = this.valueAtPosition(position);
			if (value <= 0) {
				// if I set 256, a value of 1 will become 0
				this._texture_data[stride + 0] = (clamp(value, -1, 0) + 1) * TEXTURE_BYTES_MULT;
				this._texture_data[stride + 1] = 0;
				this._texture_data[stride + 2] = 0;
			} else {
				if (value <= 1) {
					this._texture_data[stride + 0] = TEXTURE_BYTES_MULT;
					this._texture_data[stride + 1] = clamp(value, 0, 1) * TEXTURE_BYTES_MULT;
					this._texture_data[stride + 2] = 0;
				} else {
					this._texture_data[stride + 0] = TEXTURE_BYTES_MULT;
					this._texture_data[stride + 1] = TEXTURE_BYTES_MULT;
					this._texture_data[stride + 2] = (clamp(value, 1, 2) - 1) * TEXTURE_BYTES_MULT;
				}
			}
		}
	}

	static createInterpolant(positions: Float32Array, values: Float32Array) {
		const valuesCount = 1;
		const interpolatedValues = new Float32Array(valuesCount);
		return new CubicInterpolant(positions, values, valuesCount, interpolatedValues);
	}
	interpolant() {
		return (this._ramp_interpolant = this._ramp_interpolant || this._createInterpolant());
	}
	private _createInterpolant() {
		const points = this.value.points();
		const sortedPoints = ArrayUtils.sortBy(points, (point) => point.position());
		const positions = new Float32Array(sortedPoints.length);
		const values = new Float32Array(sortedPoints.length);

		let i = 0;
		for (let sortedPoint of sortedPoints) {
			positions[i] = sortedPoint.position();
			values[i] = sortedPoint.value();
			i++;
		}

		return RampParam.createInterpolant(positions, values);
	}

	valueAtPosition(position: number): number {
		return (<unknown>this.interpolant().evaluate(position)[0]) as number;
	}
}
