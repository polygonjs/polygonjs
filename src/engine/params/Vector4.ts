import {Number4, StringOrNumber4} from '../../types/GlobalTypes';
import {TypedMultipleParam} from './_Multiple';
import {Vector4} from 'three';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {isArray} from '../../core/Type';

const COMPONENT_NAMES_VECTOR4: Readonly<string[]> = ['x', 'y', 'z', 'w'];
const tmp: Number4 = [0, 0, 0, 0];

function vector2EqualsStringNumber4(v: Vector4, array: StringOrNumber4): boolean {
	return v.x == array[0] && v.y == array[1] && v.z == array[2] && v.w == array[3];
}
function stringNumber4Equals(array1: StringOrNumber4, array2: StringOrNumber4): boolean {
	return array1[0] == array2[0] && array1[1] == array2[1] && array1[2] == array2[2] && array1[3] == array2[3];
}

export class Vector4Param extends TypedMultipleParam<ParamType.VECTOR4> {
	protected override _value = new Vector4();
	x!: FloatParam;
	y!: FloatParam;
	z!: FloatParam;
	w!: FloatParam;
	static override type() {
		return ParamType.VECTOR4;
	}
	override componentNames(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR4;
	}
	override defaultValueSerialized() {
		if (isArray(this._default_value)) {
			return this._default_value;
		} else {
			return this._default_value.toArray() as Number4;
		}
	}
	override _prefilterInvalidRawInput(rawInput: any) {
		if (rawInput instanceof Vector4) {
			rawInput.toArray(tmp);
			return tmp;
		}
		return super._prefilterInvalidRawInput(rawInput);
	}
	override valueSerialized() {
		return this.value.toArray() as Number4;
	}
	private _copied_value: Number4 = [0, 0, 0, 0];
	protected override _copyValue(param: Vector4Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}
	protected override _cloneRawInput(rawInput: ParamInitValuesTypeMap[ParamType.VECTOR4]) {
		if (rawInput instanceof Vector4) {
			return rawInput.clone();
		} else {
			const newArray: StringOrNumber4 = [rawInput[0], rawInput[1], rawInput[2], rawInput[3]];
			// in case array elements are undefined
			if (newArray[0] == null) {
				newArray[0] = newArray[0] || 0;
			}
			if (newArray[1] == null) {
				newArray[1] = newArray[1] || newArray[0];
			}
			if (newArray[2] == null) {
				newArray[2] = newArray[2] || newArray[1];
			}
			if (newArray[3] == null) {
				newArray[3] = newArray[3] || newArray[2];
			}
			return newArray;
		}
	}
	static override areRawInputEqual(
		rawInput1: ParamInitValuesTypeMap[ParamType.VECTOR4],
		rawInput2: ParamInitValuesTypeMap[ParamType.VECTOR4]
	) {
		if (rawInput1 instanceof Vector4) {
			if (rawInput2 instanceof Vector4) {
				return rawInput1.equals(rawInput2);
			} else {
				return vector2EqualsStringNumber4(rawInput1, rawInput2);
			}
		} else {
			if (rawInput2 instanceof Vector4) {
				return vector2EqualsStringNumber4(rawInput2, rawInput1);
			} else {
				return stringNumber4Equals(rawInput1, rawInput2);
			}
		}
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.VECTOR4],
		val2: ParamValuesTypeMap[ParamType.VECTOR4]
	) {
		return val1.equals(val2);
	}
	override initComponents() {
		super.initComponents();
		this.x = this.components[0];
		this.y = this.components[1];
		this.z = this.components[2];
		this.w = this.components[3];
	}

	override setValueFromComponents() {
		this._value.x = this.x.value;
		this._value.y = this.y.value;
		this._value.z = this.z.value;
		this._value.w = this.w.value;
	}
}
