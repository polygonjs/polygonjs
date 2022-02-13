import {RGBAFormat, FloatType} from 'three/src/constants';
import {DataTexture} from 'three/src/textures/DataTexture';
import {CubicInterpolant} from 'three/src/math/interpolants/CubicInterpolant';
import {TypedParam} from './_Base';
import {RampValue, RampPoint, RampValueJson, RampInterpolation} from './ramp/RampValue';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamEvent} from '../poly/ParamEvent';

const STRIDE = 4;
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 1;
const TEXTURE_SIZE = TEXTURE_WIDTH * TEXTURE_HEIGHT;
const TEXTURE_BYTES_MULT = 1;

export class RampParam extends TypedParam<ParamType.RAMP> {
	static override type() {
		return ParamType.RAMP;
	}

	private _rampInterpolant: CubicInterpolant | undefined;
	private _textureData = new Float32Array(STRIDE * TEXTURE_SIZE);
	private _rampTexture = new DataTexture(this._textureData, TEXTURE_WIDTH, TEXTURE_HEIGHT, RGBAFormat, FloatType);

	static DEFAULT_VALUE = new RampValue(RampInterpolation.CUBIC, [new RampPoint(0, 0), new RampPoint(1, 1)]);
	static DEFAULT_VALUE_JSON: RampValueJson = RampParam.DEFAULT_VALUE.toJSON();

	override defaultValueSerialized() {
		if (this._default_value instanceof RampValue) {
			return this._default_value.toJSON();
		} else {
			return this._default_value;
		}
	}
	protected override _cloneRawInput(raw_input: ParamInitValuesTypeMap[ParamType.RAMP]) {
		if (raw_input instanceof RampValue) {
			return raw_input.clone();
		} else {
			return RampValue.fromJSON(raw_input).toJSON();
		}
	}
	override rawInputSerialized() {
		if (this._raw_input instanceof RampValue) {
			return this._raw_input.toJSON();
		} else {
			return RampValue.fromJSON(this._raw_input).toJSON();
		}
	}
	override valueSerialized() {
		return this.value.toJSON();
	}
	protected override _copyValue(param: RampParam) {
		this.set(param.valueSerialized());
	}

	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.RAMP],
		raw_input2: ParamInitValuesTypeMap[ParamType.RAMP]
	) {
		if (raw_input1 instanceof RampValue) {
			if (raw_input2 instanceof RampValue) {
				return raw_input1.isEqual(raw_input2);
			} else {
				return raw_input1.isEqualJSON(raw_input2);
			}
		} else {
			if (raw_input2 instanceof RampValue) {
				return raw_input2.isEqualJSON(raw_input1);
			} else {
				return RampValue.are_json_equal(raw_input1, raw_input2);
			}
		}
	}
	static override areValuesEqual(val1: ParamValuesTypeMap[ParamType.RAMP], val2: ParamValuesTypeMap[ParamType.RAMP]) {
		return val1.isEqual(val2);
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
	override isDefault(): boolean {
		if (this._default_value instanceof RampValue) {
			return this.value.isEqual(this._default_value);
		} else {
			return this.value.isEqualJSON(this._default_value);
		}
	}
	protected override processRawInput() {
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
				this._value.fromJSON(this._raw_input);
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

	override hasExpression() {
		return false;
	}

	private _resetRampInterpolant() {
		this._rampInterpolant = undefined;
		// this._ramp_texture = undefined;
	}
	rampTexture() {
		return this._rampTexture;
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
			stride = i * STRIDE;
			position = i / TEXTURE_WIDTH;
			value = this.valueAtPosition(position);
			this._textureData[stride + 0] = value * TEXTURE_BYTES_MULT;
			this._textureData[stride + 1] = 0;
			this._textureData[stride + 2] = 0;
			// if (value <= 0) {
			// 	// if I set 256, a value of 1 will become 0
			// 	this._textureData[stride + 0] = (clamp(value, -1, 0) + 1) * TEXTURE_BYTES_MULT;
			// 	this._textureData[stride + 1] = 0;
			// 	this._textureData[stride + 2] = 0;
			// } else {
			// 	if (value <= 1) {
			// 		this._textureData[stride + 0] = TEXTURE_BYTES_MULT;
			// 		this._textureData[stride + 1] = clamp(value, 0, 1) * TEXTURE_BYTES_MULT;
			// 		this._textureData[stride + 2] = 0;
			// 	} else {
			// 		this._textureData[stride + 0] = TEXTURE_BYTES_MULT;
			// 		this._textureData[stride + 1] = TEXTURE_BYTES_MULT;
			// 		this._textureData[stride + 2] = (clamp(value, 1, 2) - 1) * TEXTURE_BYTES_MULT;
			// 	}
			// }
		}
	}

	interpolant() {
		return (this._rampInterpolant = this._rampInterpolant || this._createInterpolant());
	}
	private _createInterpolant() {
		return this.value.createInterpolant();
	}

	valueAtPosition(position: number): number {
		return (<unknown>this.interpolant().evaluate(position)[0]) as number;
	}
}
