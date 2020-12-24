// import {ParamType} from '../../../poly/ParamType';
// import {ParamInitValuesTypeMap} from '../../../params/types/ParamInitValuesTypeMap';
// import {ParamValue} from '../../../params/types/ParamValue';

// import {Vector2} from 'three/src/math/Vector2';
// import {Vector3} from 'three/src/math/Vector3';
// import {Vector4} from 'three/src/math/Vector4';
// import {Color} from 'three/src/math/Color';

// // import {TypeAssert} from '../../../poly/Assert';
// import {RampParam} from '../../../params/Ramp';
// // type ConvertMethod<T extends ParamType> = (val: ParamValuesTypeMap[T]) => ParamInitValuesTypeMap[T];
// type ConvertMethod<T extends ParamType> = (val: ParamValue) => ParamInitValuesTypeMap[T];
// type ParamValuetoInitValueMapGeneric = {[key in ParamType]: ConvertMethod<key>};

// // function convert_boolean(value: ParamValuesTypeMap[ParamType.BOOLEAN]): ParamInitValuesTypeMap[ParamType.BOOLEAN] {
// // 	return value ? 1 : 0;
// // }
// // function convert_button(value: ParamValuesTypeMap[ParamType.BUTTON]): ParamInitValuesTypeMap[ParamType.BUTTON] {
// // 	return value;
// // }
// // function convert_color(value: ParamValuesTypeMap[ParamType.COLOR]): ParamInitValuesTypeMap[ParamType.COLOR] {
// // 	return value.toArray() as Number3;
// // }
// // function convert_float(value: ParamValuesTypeMap[ParamType.FLOAT]): ParamInitValuesTypeMap[ParamType.FLOAT] {
// // 	return value;
// // }
// // function convert_integer(value: ParamValuesTypeMap[ParamType.INTEGER]): ParamInitValuesTypeMap[ParamType.INTEGER] {
// // 	return value;
// // }
// // function convert_operator_path(
// // 	value: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
// // ): ParamInitValuesTypeMap[ParamType.OPERATOR_PATH] {
// // 	return value;
// // }
// // function convert_ramp(value: ParamValuesTypeMap[ParamType.RAMP]): ParamInitValuesTypeMap[ParamType.RAMP] {
// // 	return value;
// // }
// // function convert_separator(
// // 	value: ParamValuesTypeMap[ParamType.SEPARATOR]
// // ): ParamInitValuesTypeMap[ParamType.SEPARATOR] {
// // 	return value;
// // }
// // function convert_string(value: ParamValuesTypeMap[ParamType.STRING]): ParamInitValuesTypeMap[ParamType.STRING] {
// // 	return value;
// // }
// // function convert_vector2(value: ParamValuesTypeMap[ParamType.VECTOR2]): ParamInitValuesTypeMap[ParamType.VECTOR2] {
// // 	return value.toArray() as Number2;
// // }
// // function convert_vector3(value: ParamValuesTypeMap[ParamType.VECTOR3]): ParamInitValuesTypeMap[ParamType.VECTOR3] {
// // 	return value.toArray() as Number3;
// // }
// // function convert_vector4(value: ParamValuesTypeMap[ParamType.VECTOR4]): ParamInitValuesTypeMap[ParamType.VECTOR4] {
// // 	return value.toArray() as Number4;
// // }

// function convert_boolean(value: ParamValue): ParamInitValuesTypeMap[ParamType.BOOLEAN] {
// 	return value ? 1 : 0;
// }
// function convert_button(value: ParamValue): ParamInitValuesTypeMap[ParamType.BUTTON] {
// 	return null;
// }
// function convert_color(value: ParamValue): ParamInitValuesTypeMap[ParamType.COLOR] {
// 	if (CoreType.isNumber(value)) {
// 		return [value, value, value];
// 	}
// 	if (value instanceof Vector2) {
// 		const v2 = value.toArray() as Number2;
// 		return [v2[0], v2[1], v2[0]];
// 	}
// 	if (value instanceof Vector3) {
// 		return value.toArray() as Number3;
// 	}
// 	if (value instanceof Color) {
// 		return value.toArray() as Number3;
// 	}
// 	if (value instanceof Vector4) {
// 		const v4 = value.toArray() as Number4;
// 		return [v4[0], v4[1], v4[2]];
// 	}
// 	return [0, 0, 0];
// }
// function convert_float(value: ParamValue): ParamInitValuesTypeMap[ParamType.FLOAT] {
// 	if (CoreType.isNumber(value)) {
// 		return value;
// 	}
// 	if (value instanceof Vector2 || value instanceof Vector3 || value instanceof Vector4) {
// 		return value.toArray()[0];
// 	}
// 	return 0;
// }
// function convert_folder(value: ParamValue): ParamInitValuesTypeMap[ParamType.FOLDER] {
// 	return null;
// }
// function convert_integer(value: ParamValue): ParamInitValuesTypeMap[ParamType.INTEGER] {
// 	if (CoreType.isNumber(value)) {
// 		return Math.floor(value);
// 	}
// 	if (value instanceof Vector2 || value instanceof Vector3 || value instanceof Vector4) {
// 		return Math.floor(value.toArray()[0]);
// 	}
// 	return 0;
// }
// function convert_operator_path(value: ParamValue): ParamInitValuesTypeMap[ParamType.OPERATOR_PATH] {
// 	return `${value}`;
// }
// function convert_ramp(value: ParamValue): ParamInitValuesTypeMap[ParamType.RAMP] {
// 	return RampParam.DEFAULT_VALUE;
// }
// function convert_separator(value: ParamValue): ParamInitValuesTypeMap[ParamType.SEPARATOR] {
// 	return null;
// }
// function convert_string(value: ParamValue): ParamInitValuesTypeMap[ParamType.STRING] {
// 	return `${value}`;
// }
// function convert_vector2(value: ParamValue): ParamInitValuesTypeMap[ParamType.VECTOR2] {
// 	if (CoreType.isNumber(value)) {
// 		return [value, value];
// 	}
// 	if (value instanceof Vector2) {
// 		return value.toArray() as Number2;
// 	}
// 	if (value instanceof Vector3) {
// 		const v3 = value.toArray();
// 		return [v3[0], v3[1]];
// 	}
// 	if (value instanceof Color) {
// 		const v3 = value.toArray();
// 		return [v3[0], v3[1]];
// 	}
// 	if (value instanceof Vector4) {
// 		const v4 = value.toArray() as Number4;
// 		return [v4[0], v4[1]];
// 	}
// 	return [0, 0];
// }
// function convert_vector3(value: ParamValue): ParamInitValuesTypeMap[ParamType.VECTOR3] {
// 	if (CoreType.isNumber(value)) {
// 		return [value, value, value];
// 	}
// 	if (value instanceof Vector2) {
// 		const v2 = value.toArray() as Number2;
// 		return [v2[0], v2[1], v2[0]];
// 	}
// 	if (value instanceof Vector3) {
// 		return value.toArray() as Number3;
// 	}
// 	if (value instanceof Color) {
// 		return value.toArray() as Number3;
// 	}
// 	if (value instanceof Vector4) {
// 		const v4 = value.toArray() as Number4;
// 		return [v4[0], v4[1], v4[2]];
// 	}
// 	return [0, 0, 0];
// }
// function convert_vector4(value: ParamValue): ParamInitValuesTypeMap[ParamType.VECTOR4] {
// 	if (CoreType.isNumber(value)) {
// 		return [value, value, value, value];
// 	}
// 	if (value instanceof Vector2) {
// 		const v2 = value.toArray() as Number2;
// 		return [v2[0], v2[1], v2[0], v2[0]];
// 	}
// 	if (value instanceof Vector3) {
// 		const v3 = value.toArray() as Number3;
// 		return [v3[0], v3[1], v3[2], v3[0]];
// 	}
// 	if (value instanceof Color) {
// 		const v3 = value.toArray() as Number3;
// 		return [v3[0], v3[1], v3[2], v3[0]];
// 	}
// 	if (value instanceof Vector4) {
// 		return value.toArray() as Number4;
// 	}
// 	return [0, 0, 0, 0];
// }

// const ParamValuetoInitValueMap: ParamValuetoInitValueMapGeneric = {
// 	[ParamType.BOOLEAN]: convert_boolean,
// 	[ParamType.BUTTON]: convert_button,
// 	[ParamType.COLOR]: convert_color,
// 	[ParamType.FLOAT]: convert_float,
// 	[ParamType.FOLDER]: convert_folder,
// 	[ParamType.INTEGER]: convert_integer,
// 	[ParamType.OPERATOR_PATH]: convert_operator_path,
// 	[ParamType.RAMP]: convert_ramp,
// 	[ParamType.SEPARATOR]: convert_separator,
// 	[ParamType.STRING]: convert_string,
// 	[ParamType.VECTOR2]: convert_vector2,
// 	[ParamType.VECTOR3]: convert_vector3,
// 	[ParamType.VECTOR4]: convert_vector4,
// };

// export class ParamValueToDefaultConverter {
// 	// static from_value<T extends ParamType>(type: T, value: ParamValuesTypeMap[T]): ParamInitValuesTypeMap[T] {
// 	// 	// TODO: typescript, try and work out of I can avoid this cast (check file Debug.ts in same folder)
// 	// 	const method: ConvertMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as ConvertMethod<T>;
// 	// 	return method(value);
// 	// }
// 	static from_value<T extends ParamType>(type: T, value: ParamValue): ParamInitValuesTypeMap[T] {
// 		// const method: ConvertMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as ConvertMethod<T>;
// 		const method: ConvertMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as ConvertMethod<T>;
// 		return method(value);
// 	}
// }
