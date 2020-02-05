// import {ParamType} from 'src/engine/poly/ParamType';
// import {ParamValuesTypeMap} from './ParamsController';
// // import lodash_isNumber from 'lodash/isNumber';
// // import lodash_isArray from 'lodash/isArray';
// // import lodash_isString from 'lodash/isString';
// import {Vector2} from 'three/src/math/Vector2';
// import {Vector3} from 'three/src/math/Vector3';
// import {Vector4} from 'three/src/math/Vector4';
// import {Color} from 'three/src/math/Color';
// // import {TypeAssert} from 'src/engine/poly/Assert';
// // import {RampParam} from 'src/engine/params/Ramp';
// // type ConvertMethod<T extends ParamType> = (val: ParamValuesTypeMap[T]) => ParamValuesTypeMap[T];
// type Method<T extends ParamType> = (val1: ParamValuesTypeMap[T]) => ParamValuesTypeMap[T];
// type ParamValuetoInitValueMapGeneric = {[key in ParamType]: Method<key>};

// // function boolean(value: ParamValuesTypeMap[ParamType.BOOLEAN]): ParamValuesTypeMap[ParamType.BOOLEAN] {
// // 	return value ? 1 : 0;
// // }
// // function button(value: ParamValuesTypeMap[ParamType.BUTTON]): ParamValuesTypeMap[ParamType.BUTTON] {
// // 	return value;
// // }
// // function color(value: ParamValuesTypeMap[ParamType.COLOR]): ParamValuesTypeMap[ParamType.COLOR] {
// // 	return value.toArray() as Number3;
// // }
// // function float(value: ParamValuesTypeMap[ParamType.FLOAT]): ParamValuesTypeMap[ParamType.FLOAT] {
// // 	return value;
// // }
// // function integer(value: ParamValuesTypeMap[ParamType.INTEGER]): ParamValuesTypeMap[ParamType.INTEGER] {
// // 	return value;
// // }
// // function operator_path(
// // 	value: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
// // ): ParamValuesTypeMap[ParamType.OPERATOR_PATH] {
// // 	return value;
// // }
// // function ramp(value: ParamValuesTypeMap[ParamType.RAMP]): ParamValuesTypeMap[ParamType.RAMP] {
// // 	return value;
// // }
// // function separator(
// // 	value: ParamValuesTypeMap[ParamType.SEPARATOR]
// // ): ParamValuesTypeMap[ParamType.SEPARATOR] {
// // 	return value;
// // }
// // function string(value: ParamValuesTypeMap[ParamType.STRING]): ParamValuesTypeMap[ParamType.STRING] {
// // 	return value;
// // }
// // function vector2(value: ParamValuesTypeMap[ParamType.VECTOR2]): ParamValuesTypeMap[ParamType.VECTOR2] {
// // 	return value.toArray() as Number2;
// // }
// // function vector3(value: ParamValuesTypeMap[ParamType.VECTOR3]): ParamValuesTypeMap[ParamType.VECTOR3] {
// // 	return value.toArray() as Number3;
// // }
// // function vector4(value: ParamValuesTypeMap[ParamType.VECTOR4]): ParamValuesTypeMap[ParamType.VECTOR4] {
// // 	return value.toArray() as Number4;
// // }

// function boolean(value: ParamValuesTypeMap[ParamType.BOOLEAN]): ParamValuesTypeMap[ParamType.BOOLEAN] {
// 	return value;
// }
// function button(value: ParamValuesTypeMap[ParamType.BUTTON]): ParamValuesTypeMap[ParamType.BUTTON] {
// 	return null;
// }
// function color(value: ParamValuesTypeMap[ParamType.COLOR]): ParamValuesTypeMap[ParamType.COLOR] {
// 	if (value instanceof Color) {
// 		return value.clone();
// 	} else {
// 		return new Color();
// 	}
// }
// function float(value: ParamValuesTypeMap[ParamType.FLOAT]): ParamValuesTypeMap[ParamType.FLOAT] {
// 	return value;
// }
// function integer(value: ParamValuesTypeMap[ParamType.INTEGER]): ParamValuesTypeMap[ParamType.INTEGER] {
// 	return value;
// }
// function operator_path(
// 	value: ParamValuesTypeMap[ParamType.OPERATOR_PATH]
// ): ParamValuesTypeMap[ParamType.OPERATOR_PATH] {
// 	return value;
// }
// function ramp(value: ParamValuesTypeMap[ParamType.RAMP]): ParamValuesTypeMap[ParamType.RAMP] {
// 	return value.clone();
// }
// function separator(value: ParamValuesTypeMap[ParamType.SEPARATOR]): ParamValuesTypeMap[ParamType.SEPARATOR] {
// 	return null;
// }

// function string(value: ParamValuesTypeMap[ParamType.STRING]): ParamValuesTypeMap[ParamType.STRING] {
// 	return value;
// }
// function vector2(value: ParamValuesTypeMap[ParamType.VECTOR2]): ParamValuesTypeMap[ParamType.VECTOR2] {
// 	if (value instanceof Vector2) {
// 		return value.clone();
// 	} else {
// 		// assume that if one of them is not Vector2, then they have an expression, so most likely are not equal
// 		return new Vector2();
// 	}
// }
// function vector3(value: ParamValuesTypeMap[ParamType.VECTOR3]): ParamValuesTypeMap[ParamType.VECTOR3] {
// 	if (value instanceof Vector3) {
// 		return value.clone();
// 	} else {
// 		// assume that if one of them is not Vector3, then they have an expression, so most likely are not equal
// 		return new Vector3();
// 	}
// }
// function vector4(value: ParamValuesTypeMap[ParamType.VECTOR4]): ParamValuesTypeMap[ParamType.VECTOR4] {
// 	if (value instanceof Vector4) {
// 		return value.clone();
// 	} else {
// 		// assume that if one of them is not Vector3, then they have an expression, so most likely are not equal
// 		return new Vector4();
// 	}
// }

// const ParamValuetoInitValueMap: ParamValuetoInitValueMapGeneric = {
// 	[ParamType.BOOLEAN]: boolean,
// 	[ParamType.BUTTON]: button,
// 	[ParamType.COLOR]: color,
// 	[ParamType.FLOAT]: float,
// 	[ParamType.INTEGER]: integer,
// 	[ParamType.OPERATOR_PATH]: operator_path,
// 	[ParamType.RAMP]: ramp,
// 	[ParamType.SEPARATOR]: separator,
// 	[ParamType.STRING]: string,
// 	[ParamType.VECTOR2]: vector2,
// 	[ParamType.VECTOR3]: vector3,
// 	[ParamType.VECTOR4]: vector4,
// };

// export class ParamValueCloner {
// 	// static from_value<T extends ParamType>(type: T, value: ParamValuesTypeMap[T]): ParamValuesTypeMap[T] {
// 	// 	// TODO: typescript, try and work out of I can avoid this cast (check file Debug.ts in same folder)
// 	// 	const method: ConvertMethod<T> = (<unknown>ParamValuetoInitValueMap[type]) as ConvertMethod<T>;
// 	// 	return method(value);
// 	// }
// 	static clone<T extends ParamType>(type: T, value: ParamValuesTypeMap[T]): ParamValuesTypeMap[T] {
// 		const method: Method<T> = (<unknown>ParamValuetoInitValueMap[type]) as Method<T>;
// 		return method(value);
// 	}
// }
