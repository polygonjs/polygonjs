// import {ParamType} from 'src/engine/poly/ParamType';
// import {ParamInitValuesTypeMap, ParamValuesTypeMap} from './ParamsController';
// // import lodash_isString from 'lodash/isString';
// import {Vector2} from 'three/src/math/Vector2';
// import {Vector3} from 'three/src/math/Vector3';
// import {Vector4} from 'three/src/math/Vector4';
// import {Color} from 'three/src/math/Color';
// import {RampValue} from 'src/engine/params/ramp/RampValue';
// // import {TypeAssert} from 'src/engine/poly/Assert';
// // type ConvertMethod<T extends ParamType> = (val: ParamValuesTypeMap[T]) => ParamInitValuesTypeMap[T];
// type IsEqualMethod<T extends ParamType> = (val1: ParamValuesTypeMap[T], val2: ParamValuesTypeMap[T]) => boolean;
// type ParamValuetoInitValueMapGeneric = {[key in ParamType]: IsEqualMethod<key>};

// // function is_equal_boolean(value: ParamValuesTypeMap[ParamType.BOOLEAN]): ParamInitValuesTypeMap[ParamType.BOOLEAN] {
// // 	return value ? 1 : 0;
// // }
// // function is_equal_button(value: ParamValuesTypeMap[ParamType.BUTTON]): ParamInitValuesTypeMap[ParamType.BUTTON] {
// // 	return value;
// // }
// // function is_equal_color(value: ParamValuesTypeMap[ParamType.COLOR]): ParamInitValuesTypeMap[ParamType.COLOR] {
// // 	return value.toArray() as Number3;
// // }
// // function is_equal_float(value: ParamValuesTypeMap[ParamType.FLOAT]): ParamInitValuesTypeMap[ParamType.FLOAT] {
// // 	return value;
// // }
// // function is_equal_integer(value: ParamValuesTypeMap[ParamType.INTEGER]): ParamInitValuesTypeMap[ParamType.INTEGER] {
// // 	return value;
// // }
// // function is_equal_operator_path(
// // 	value: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
// // ): ParamInitValuesTypeMap[ParamType.OPERATOR_PATH] {
// // 	return value;
// // }
// // function is_equal_ramp(value: ParamValuesTypeMap[ParamType.RAMP]): ParamInitValuesTypeMap[ParamType.RAMP] {
// // 	return value;
// // }
// // function is_equal_separator(
// // 	value: ParamValuesTypeMap[ParamType.SEPARATOR]
// // ): ParamInitValuesTypeMap[ParamType.SEPARATOR] {
// // 	return value;
// // }
// // function is_equal_string(value: ParamValuesTypeMap[ParamType.STRING]): ParamInitValuesTypeMap[ParamType.STRING] {
// // 	return value;
// // }
// // function is_equal_vector2(value: ParamValuesTypeMap[ParamType.VECTOR2]): ParamInitValuesTypeMap[ParamType.VECTOR2] {
// // 	return value.toArray() as Number2;
// // }
// // function is_equal_vector3(value: ParamValuesTypeMap[ParamType.VECTOR3]): ParamInitValuesTypeMap[ParamType.VECTOR3] {
// // 	return value.toArray() as Number3;
// // }
// // function is_equal_vector4(value: ParamValuesTypeMap[ParamType.VECTOR4]): ParamInitValuesTypeMap[ParamType.VECTOR4] {
// // 	return value.toArray() as Number4;
// // }

// function is_equal_boolean(
// 	value1: ParamInitValuesTypeMap[ParamType.BOOLEAN],
// 	value2: ParamInitValuesTypeMap[ParamType.BOOLEAN]
// ): boolean {
// 	return value1 == value2;
// }
// function is_equal_button(
// 	value1: ParamInitValuesTypeMap[ParamType.BUTTON],
// 	value2: ParamInitValuesTypeMap[ParamType.BUTTON]
// ): boolean {
// 	return true;
// }
// function is_equal_color(
// 	value1: ParamInitValuesTypeMap[ParamType.COLOR],
// 	value2: ParamInitValuesTypeMap[ParamType.COLOR]
// ): boolean {
// 	if (value1 instanceof Color && value2 instanceof Color) {
// 		return value1.equals(value2);
// 	} else {
// 		// assume that if one of them is not color, then they have an expression, so most likely are not equal
// 		return false;
// 	}
// }
// function is_equal_float(
// 	value1: ParamInitValuesTypeMap[ParamType.FLOAT],
// 	value2: ParamInitValuesTypeMap[ParamType.FLOAT]
// ): boolean {
// 	return value1 == value2;
// }
// function is_equal_integer(
// 	value1: ParamInitValuesTypeMap[ParamType.INTEGER],
// 	value2: ParamInitValuesTypeMap[ParamType.INTEGER]
// ): boolean {
// 	return value1 == value2;
// }
// function is_equal_operator_path(
// 	value1: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH],
// 	value2: ParamInitValuesTypeMap[ParamType.OPERATOR_PATH]
// ): boolean {
// 	return value1 == value2;
// }
// function is_equal_ramp(
// 	value1: ParamInitValuesTypeMap[ParamType.RAMP],
// 	value2: ParamInitValuesTypeMap[ParamType.RAMP]
// ): boolean {
// 	return RampValue.are_json_equal(value1, value2);
// }
// function is_equal_separator(
// 	value1: ParamInitValuesTypeMap[ParamType.SEPARATOR],
// 	value2: ParamInitValuesTypeMap[ParamType.SEPARATOR]
// ): boolean {
// 	return true;
// }
// function is_equal_string(
// 	value1: ParamInitValuesTypeMap[ParamType.STRING],
// 	value2: ParamInitValuesTypeMap[ParamType.STRING]
// ): boolean {
// 	return value1 == value2;
// }
// function is_equal_vector2(
// 	value1: ParamInitValuesTypeMap[ParamType.VECTOR2],
// 	value2: ParamInitValuesTypeMap[ParamType.VECTOR2]
// ): boolean {
// 	if (value1 instanceof Vector2 && value2 instanceof Vector2) {
// 		return value1.equals(value2);
// 	} else {
// 		// assume that if one of them is not Vector2, then they have an expression, so most likely are not equal
// 		return false;
// 	}
// }
// function is_equal_vector3(
// 	value1: ParamInitValuesTypeMap[ParamType.VECTOR3],
// 	value2: ParamInitValuesTypeMap[ParamType.VECTOR3]
// ): boolean {
// 	if (value1 instanceof Vector3 && value2 instanceof Vector3) {
// 		return value1.equals(value2);
// 	} else {
// 		// assume that if one of them is not Vector3, then they have an expression, so most likely are not equal
// 		return false;
// 	}
// }
// function is_equal_vector4(
// 	value1: ParamInitValuesTypeMap[ParamType.VECTOR4],
// 	value2: ParamInitValuesTypeMap[ParamType.VECTOR4]
// ): boolean {
// 	if (value1 instanceof Vector4 && value2 instanceof Vector4) {
// 		return value1.equals(value2);
// 	} else {
// 		// assume that if one of them is not Vector4, then they have an expression, so most likely are not equal
// 		return false;
// 	}
// }

// const ParamValuetoInitValueMap: ParamValuetoInitValueMapGeneric = {
// 	[ParamType.BOOLEAN]: is_equal_boolean,
// 	[ParamType.BUTTON]: is_equal_button,
// 	[ParamType.COLOR]: is_equal_color,
// 	[ParamType.FLOAT]: is_equal_float,
// 	[ParamType.INTEGER]: is_equal_integer,
// 	[ParamType.OPERATOR_PATH]: is_equal_operator_path,
// 	[ParamType.RAMP]: is_equal_ramp,
// 	[ParamType.SEPARATOR]: is_equal_separator,
// 	[ParamType.STRING]: is_equal_string,
// 	[ParamType.VECTOR2]: is_equal_vector2,
// 	[ParamType.VECTOR3]: is_equal_vector3,
// 	[ParamType.VECTOR4]: is_equal_vector4,
// };

// export class ParamValueComparer {
// 	// static from_value<T extends ParamType>(type: T, value: ParamValuesTypeMap[T]): ParamInitValuesTypeMap[T] {
// 	// 	// TODO: typescript, try and work out of I can avoid this cast (check file Debug.ts in same folder)
// 	// 	const method: ConvertMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as ConvertMethod<T>;
// 	// 	return method(value);
// 	// }
// 	static is_equal<T extends ParamType>(
// 		type: T,
// 		value1: ParamValuesTypeMap[T],
// 		value2: ParamValuesTypeMap[T]
// 	): boolean {
// 		const method: IsEqualMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as IsEqualMethod<T>;
// 		return method(value1, value2);
// 	}
// }
