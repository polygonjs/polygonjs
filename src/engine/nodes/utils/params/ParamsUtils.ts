import {ParamType} from 'src/engine/poly/ParamType';
import {ParamValuesTypeMap, ParamInitValuesTypeMap} from './ParamsController';

type ConvertMethod<T extends ParamType> = (val: ParamValuesTypeMap[T]) => ParamInitValuesTypeMap[T];
type ParamValuetoInitValueMapGeneric = {[key in ParamType]: ConvertMethod<key>};

function convert_boolean(value: ParamValuesTypeMap[ParamType.BOOLEAN]): ParamInitValuesTypeMap[ParamType.BOOLEAN] {
	return value ? 1 : 0;
}
function convert_button(value: ParamValuesTypeMap[ParamType.BUTTON]): ParamInitValuesTypeMap[ParamType.BUTTON] {
	return value;
}
function convert_color(value: ParamValuesTypeMap[ParamType.COLOR]): ParamInitValuesTypeMap[ParamType.COLOR] {
	return value.toArray() as Number3;
}
function convert_float(value: ParamValuesTypeMap[ParamType.FLOAT]): ParamInitValuesTypeMap[ParamType.FLOAT] {
	return value;
}
function convert_integer(value: ParamValuesTypeMap[ParamType.INTEGER]): ParamInitValuesTypeMap[ParamType.INTEGER] {
	return value;
}
function convert_operator_path(
	value: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
): ParamInitValuesTypeMap[ParamType.OPERATOR_PATH] {
	return value;
}
function convert_ramp(value: ParamValuesTypeMap[ParamType.RAMP]): ParamInitValuesTypeMap[ParamType.RAMP] {
	return value;
}
function convert_separator(
	value: ParamValuesTypeMap[ParamType.SEPARATOR]
): ParamInitValuesTypeMap[ParamType.SEPARATOR] {
	return value;
}
function convert_string(value: ParamValuesTypeMap[ParamType.STRING]): ParamInitValuesTypeMap[ParamType.STRING] {
	return value;
}
function convert_vector2(value: ParamValuesTypeMap[ParamType.VECTOR2]): ParamInitValuesTypeMap[ParamType.VECTOR2] {
	return value.toArray() as Number2;
}
function convert_vector3(value: ParamValuesTypeMap[ParamType.VECTOR3]): ParamInitValuesTypeMap[ParamType.VECTOR3] {
	return value.toArray() as Number3;
}
function convert_vector4(value: ParamValuesTypeMap[ParamType.VECTOR4]): ParamInitValuesTypeMap[ParamType.VECTOR4] {
	return value.toArray() as Number4;
}

const ParamValuetoInitValueMap: ParamValuetoInitValueMapGeneric = {
	[ParamType.BOOLEAN]: convert_boolean,
	[ParamType.BUTTON]: convert_button,
	[ParamType.COLOR]: convert_color,
	[ParamType.FLOAT]: convert_float,
	[ParamType.INTEGER]: convert_integer,
	[ParamType.OPERATOR_PATH]: convert_operator_path,
	[ParamType.RAMP]: convert_ramp,
	[ParamType.SEPARATOR]: convert_separator,
	[ParamType.STRING]: convert_string,
	[ParamType.VECTOR2]: convert_vector2,
	[ParamType.VECTOR3]: convert_vector3,
	[ParamType.VECTOR4]: convert_vector4,
};

export class ParamsValueToDefaultConverter {
	static convert<T extends ParamType>(type: T, value: ParamValuesTypeMap[T]): ParamInitValuesTypeMap[T] {
		// TODO: typescript, try and work out of I can avoid this cast (check file Debug.ts in same folder)
		const method: ConvertMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as ConvertMethod<T>;
		return method(value);
	}
}
