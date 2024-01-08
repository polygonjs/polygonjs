// import {Vector2, Vector3, Vector4} from 'three';
// import {NamedFunction2} from './_Base';

import {Color, Vector2, Vector3, Vector4} from 'three';
import {_matchArrayLength} from './_ArrayUtils';
import {NamedFunction} from './_Base';
import {clamp as _clamp} from '../../core/math/_Module';
import {JsConnectionPointType} from '../nodes/utils/io/connections/Js';

abstract class MathNamedFunction2<ARGS extends [any, any]> extends NamedFunction<ARGS, string[]> {}
abstract class MathNamedFunction3<ARGS extends [any, any, any]> extends NamedFunction<ARGS, string[]> {}
abstract class MathNamedFunction4<ARGS extends [any, any, any, any]> extends NamedFunction<ARGS, string[]> {}
abstract class MathNamedFunction5<ARGS extends [any, any, any, any, any]> extends NamedFunction<ARGS, string[]> {}
abstract class MathNamedFunction6<ARGS extends [any, any, any, any, any, any]> extends NamedFunction<ARGS, string[]> {}
abstract class MathNamedFunction7<ARGS extends [any, any, any, any, any, any, any]> extends NamedFunction<
	ARGS,
	string[]
> {}
abstract class MathNamedFunction8<ARGS extends [any, any, any, any, any, any, any, any]> extends NamedFunction<
	ARGS,
	string[]
> {}

type MathFunction1 = (x: number) => number;
type MathFunction2 = (x: number, arg1: number) => number;
type MathFunction3 = (x: number, arg1: number, arg2: number) => number;
type MathFunction4 = (x: number, arg1: number, arg2: number, arg3: number) => number;
type MathFunction5 = (x: number, arg1: number, arg2: number, arg3: number, arg4: number) => number;

export type MathVectorFunction1 = 'mathColor_1' | 'mathVector2_1' | 'mathVector3_1' | 'mathVector4_1';
export type MathVectorFunction2 = 'mathColor_2' | 'mathVector2_2' | 'mathVector3_2' | 'mathVector4_2';
export type MathVectorFunction3 = 'mathColor_3' | 'mathVector2_3' | 'mathVector3_3' | 'mathVector4_3';
export type MathVectorFunction3vvf = 'mathColor_3vvf' | 'mathVector2_3vvf' | 'mathVector3_3vvf' | 'mathVector4_3vvf';
export type MathVectorFunction4 = 'mathColor_4' | 'mathVector2_4' | 'mathVector3_4' | 'mathVector4_4';
export type MathVectorFunction5 = 'mathColor_5' | 'mathVector2_5' | 'mathVector3_5' | 'mathVector4_5';
export type MathVectorFunction =
	| MathVectorFunction1
	| MathVectorFunction2
	| MathVectorFunction3
	| MathVectorFunction3vvf
	| MathVectorFunction4
	| MathVectorFunction5;
export type MathFloat = 'mathFloat_1' | 'mathFloat_2' | 'mathFloat_3' | 'mathFloat_4' | 'mathFloat_5';
export type MathPrimArray =
	| 'mathPrimArray_1'
	| 'mathPrimArray_2'
	| 'mathPrimArray_3'
	| 'mathPrimArray_4'
	| 'mathPrimArray_5';
export type MathVectorArray =
	| 'mathVectorArray_1'
	| 'mathVectorArray_2'
	| 'mathVectorArray_3'
	| 'mathVectorArray_4'
	| 'mathVectorArray_5';

export type VectorFunctionName<T extends MathVectorFunction> = (inputType: JsConnectionPointType) => T | undefined;
export const _vectorFunctionName_1: VectorFunctionName<MathVectorFunction1> = (inputType: JsConnectionPointType) => {
	if (inputType == JsConnectionPointType.COLOR) {
		return 'mathColor_1';
	}
	if (inputType == JsConnectionPointType.VECTOR2) {
		return 'mathVector2_1';
	}
	if (inputType == JsConnectionPointType.VECTOR3) {
		return 'mathVector3_1';
	}
	if (inputType == JsConnectionPointType.VECTOR4) {
		return 'mathVector4_1';
	}
};
export const _vectorFunctionName_2: VectorFunctionName<MathVectorFunction2> = (inputType: JsConnectionPointType) => {
	if (inputType == JsConnectionPointType.COLOR) {
		return 'mathColor_2';
	}
	if (inputType == JsConnectionPointType.VECTOR2) {
		return 'mathVector2_2';
	}
	if (inputType == JsConnectionPointType.VECTOR3) {
		return 'mathVector3_2';
	}
	if (inputType == JsConnectionPointType.VECTOR4) {
		return 'mathVector4_2';
	}
};
export const _vectorFunctionName_3: VectorFunctionName<MathVectorFunction3> = (inputType: JsConnectionPointType) => {
	if (inputType == JsConnectionPointType.COLOR) {
		return 'mathColor_3';
	}
	if (inputType == JsConnectionPointType.VECTOR2) {
		return 'mathVector2_3';
	}
	if (inputType == JsConnectionPointType.VECTOR3) {
		return 'mathVector3_3';
	}
	if (inputType == JsConnectionPointType.VECTOR4) {
		return 'mathVector4_3';
	}
};
export const _vectorFunctionName_3vvf: VectorFunctionName<MathVectorFunction3vvf> = (
	inputType: JsConnectionPointType
) => {
	if (inputType == JsConnectionPointType.COLOR) {
		return 'mathColor_3vvf';
	}
	if (inputType == JsConnectionPointType.VECTOR2) {
		return 'mathVector2_3vvf';
	}
	if (inputType == JsConnectionPointType.VECTOR3) {
		return 'mathVector3_3vvf';
	}
	if (inputType == JsConnectionPointType.VECTOR4) {
		return 'mathVector4_3vvf';
	}
};
export const _vectorFunctionName_4: VectorFunctionName<MathVectorFunction4> = (inputType: JsConnectionPointType) => {
	if (inputType == JsConnectionPointType.COLOR) {
		return 'mathColor_4';
	}
	if (inputType == JsConnectionPointType.VECTOR2) {
		return 'mathVector2_4';
	}
	if (inputType == JsConnectionPointType.VECTOR3) {
		return 'mathVector3_4';
	}
	if (inputType == JsConnectionPointType.VECTOR4) {
		return 'mathVector4_4';
	}
};
export const _vectorFunctionName_5: VectorFunctionName<MathVectorFunction5> = (inputType: JsConnectionPointType) => {
	if (inputType == JsConnectionPointType.COLOR) {
		return 'mathColor_5';
	}
	if (inputType == JsConnectionPointType.VECTOR2) {
		return 'mathVector2_5';
	}
	if (inputType == JsConnectionPointType.VECTOR3) {
		return 'mathVector3_5';
	}
	if (inputType == JsConnectionPointType.VECTOR4) {
		return 'mathVector4_5';
	}
};

export type MathArrayVectorElement = Color | Vector2 | Vector3 | Vector4;
type MathArrayVectorElementFunction1<T extends MathArrayVectorElement> = (func: MathFunction1, src: T, target: T) => T;
type MathArrayVectorElementFunction2<T extends MathArrayVectorElement> = (
	func: MathFunction2,
	src: T,
	arg1: T,
	target: T
) => T;
type MathArrayVectorElementFunction3<T extends MathArrayVectorElement> = (
	func: MathFunction3,
	src: T,
	arg1: T,
	arg2: T,
	target: T
) => T;
type MathArrayVectorElementFunction3VVF<T extends MathArrayVectorElement> = (
	func: MathFunction3,
	src: T,
	arg1: T,
	arg2: number,
	target: T
) => T;
type MathArrayVectorElementFunction4<T extends MathArrayVectorElement> = (
	func: MathFunction4,
	src: T,
	arg1: T,
	arg2: T,
	arg3: T,
	target: T
) => T;
type MathArrayVectorElementFunction5<T extends MathArrayVectorElement> = (
	func: MathFunction5,
	src: T,
	arg1: T,
	arg2: T,
	arg3: T,
	arg4: T,
	target: T
) => T;

// Color
const COLOR_FUNC_1: MathArrayVectorElementFunction1<Color> = (
	_func: MathFunction1,
	src: Color,
	target: Color
): Color => {
	target.r = _func(src.r);
	target.g = _func(src.g);
	target.b = _func(src.b);
	return target;
};
const COLOR_FUNC_2: MathArrayVectorElementFunction2<Color> = (
	_func: MathFunction2,
	src: Color,
	arg1: Color,
	target: Color
): Color => {
	target.r = _func(src.r, arg1.r);
	target.g = _func(src.g, arg1.g);
	target.b = _func(src.b, arg1.b);
	return target;
};
const COLOR_FUNC_3: MathArrayVectorElementFunction3<Color> = (
	_func: MathFunction3,
	src: Color,
	arg1: Color,
	arg2: Color,
	target: Color
): Color => {
	target.r = _func(src.r, arg1.r, arg2.r);
	target.g = _func(src.g, arg1.g, arg2.g);
	target.b = _func(src.b, arg1.b, arg2.b);
	return target;
};
const COLOR_FUNC_3VVF: MathArrayVectorElementFunction3VVF<Color> = (
	_func: MathFunction3,
	src: Color,
	arg1: Color,
	arg2: number,
	target: Color
): Color => {
	target.r = _func(src.r, arg1.r, arg2);
	target.g = _func(src.g, arg1.g, arg2);
	target.b = _func(src.b, arg1.b, arg2);
	return target;
};
const COLOR_FUNC_4: MathArrayVectorElementFunction4<Color> = (
	_func: MathFunction4,
	src: Color,
	arg1: Color,
	arg2: Color,
	arg3: Color,
	target: Color
): Color => {
	target.r = _func(src.r, arg1.r, arg2.r, arg3.r);
	target.g = _func(src.g, arg1.g, arg2.g, arg3.g);
	target.b = _func(src.b, arg1.b, arg2.b, arg3.b);
	return target;
};
const COLOR_FUNC_5: MathArrayVectorElementFunction5<Color> = (
	_func: MathFunction5,
	src: Color,
	arg1: Color,
	arg2: Color,
	arg3: Color,
	arg4: Color,
	target: Color
): Color => {
	target.r = _func(src.r, arg1.r, arg2.r, arg3.r, arg4.r);
	target.g = _func(src.g, arg1.g, arg2.g, arg3.g, arg4.g);
	target.b = _func(src.b, arg1.b, arg2.b, arg3.b, arg4.b);
	return target;
};
// Vector2
const VECTOR2_FUNC_1: MathArrayVectorElementFunction1<Vector2> = (
	_func: MathFunction1,
	src: Vector2,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x);
	target.y = _func(src.y);
	return target;
};
const VECTOR2_FUNC_2: MathArrayVectorElementFunction2<Vector2> = (
	_func: MathFunction2,
	src: Vector2,
	arg1: Vector2,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x, arg1.x);
	target.y = _func(src.y, arg1.y);
	return target;
};
const VECTOR2_FUNC_3: MathArrayVectorElementFunction3<Vector2> = (
	_func: MathFunction3,
	src: Vector2,
	arg1: Vector2,
	arg2: Vector2,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x, arg1.x, arg2.x);
	target.y = _func(src.y, arg1.y, arg2.y);
	return target;
};
const VECTOR2_FUNC_3VVF: MathArrayVectorElementFunction3VVF<Vector2> = (
	_func: MathFunction3,
	src: Vector2,
	arg1: Vector2,
	arg2: number,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x, arg1.x, arg2);
	target.y = _func(src.y, arg1.y, arg2);
	return target;
};
const VECTOR2_FUNC_4: MathArrayVectorElementFunction4<Vector2> = (
	_func: MathFunction4,
	src: Vector2,
	arg1: Vector2,
	arg2: Vector2,
	arg3: Vector2,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x, arg1.x, arg2.x, arg3.x);
	target.y = _func(src.y, arg1.y, arg2.y, arg3.y);
	return target;
};
const VECTOR2_FUNC_5: MathArrayVectorElementFunction5<Vector2> = (
	_func: MathFunction5,
	src: Vector2,
	arg1: Vector2,
	arg2: Vector2,
	arg3: Vector2,
	arg4: Vector2,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x, arg1.x, arg2.x, arg3.x, arg4.x);
	target.y = _func(src.y, arg1.y, arg2.y, arg3.y, arg4.y);
	return target;
};
// Vector3
const VECTOR3_FUNC_1: MathArrayVectorElementFunction1<Vector3> = (
	_func: MathFunction1,
	src: Vector3,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x);
	target.y = _func(src.y);
	target.z = _func(src.z);
	return target;
};
const VECTOR3_FUNC_2: MathArrayVectorElementFunction2<Vector3> = (
	_func: MathFunction2,
	src: Vector3,
	arg1: Vector3,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x, arg1.x);
	target.y = _func(src.y, arg1.y);
	target.z = _func(src.z, arg1.z);
	return target;
};
const VECTOR3_FUNC_3: MathArrayVectorElementFunction3<Vector3> = (
	_func: MathFunction3,
	src: Vector3,
	arg1: Vector3,
	arg2: Vector3,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x, arg1.x, arg2.x);
	target.y = _func(src.y, arg1.y, arg2.y);
	target.z = _func(src.z, arg1.z, arg2.z);
	return target;
};
const VECTOR3_FUNC_3VVF: MathArrayVectorElementFunction3VVF<Vector3> = (
	_func: MathFunction3,
	src: Vector3,
	arg1: Vector3,
	arg2: number,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x, arg1.x, arg2);
	target.y = _func(src.y, arg1.y, arg2);
	target.z = _func(src.z, arg1.z, arg2);
	return target;
};
const VECTOR3_FUNC_4: MathArrayVectorElementFunction4<Vector3> = (
	_func: MathFunction4,
	src: Vector3,
	arg1: Vector3,
	arg2: Vector3,
	arg3: Vector3,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x, arg1.x, arg2.x, arg3.x);
	target.y = _func(src.y, arg1.y, arg2.y, arg3.y);
	target.z = _func(src.z, arg1.z, arg2.z, arg3.z);
	return target;
};
const VECTOR3_FUNC_5: MathArrayVectorElementFunction5<Vector3> = (
	_func: MathFunction5,
	src: Vector3,
	arg1: Vector3,
	arg2: Vector3,
	arg3: Vector3,
	arg4: Vector3,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x, arg1.x, arg2.x, arg3.x, arg4.x);
	target.y = _func(src.y, arg1.y, arg2.y, arg3.y, arg4.y);
	target.z = _func(src.z, arg1.z, arg2.z, arg3.z, arg4.z);
	return target;
};
// Vector4
const VECTOR4_FUNC_1: MathArrayVectorElementFunction1<Vector4> = (
	_func: MathFunction1,
	src: Vector4,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x);
	target.y = _func(src.y);
	target.z = _func(src.z);
	target.w = _func(src.w);
	return target;
};
const VECTOR4_FUNC_2: MathArrayVectorElementFunction2<Vector4> = (
	_func: MathFunction2,
	src: Vector4,
	arg1: Vector4,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x, arg1.x);
	target.y = _func(src.y, arg1.y);
	target.z = _func(src.z, arg1.z);
	target.w = _func(src.w, arg1.w);
	return target;
};
const VECTOR4_FUNC_3: MathArrayVectorElementFunction3<Vector4> = (
	_func: MathFunction3,
	src: Vector4,
	arg1: Vector4,
	arg2: Vector4,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x, arg1.x, arg2.x);
	target.y = _func(src.y, arg1.y, arg2.y);
	target.z = _func(src.z, arg1.z, arg2.z);
	target.w = _func(src.w, arg1.w, arg2.w);
	return target;
};
const VECTOR4_FUNC_3VVF: MathArrayVectorElementFunction3VVF<Vector4> = (
	_func: MathFunction3,
	src: Vector4,
	arg1: Vector4,
	arg2: number,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x, arg1.x, arg2);
	target.y = _func(src.y, arg1.y, arg2);
	target.z = _func(src.z, arg1.z, arg2);
	target.w = _func(src.w, arg1.w, arg2);
	return target;
};
const VECTOR4_FUNC_4: MathArrayVectorElementFunction4<Vector4> = (
	_func: MathFunction4,
	src: Vector4,
	arg1: Vector4,
	arg2: Vector4,
	arg3: Vector4,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x, arg1.x, arg2.x, arg3.x);
	target.y = _func(src.y, arg1.y, arg2.y, arg3.y);
	target.z = _func(src.z, arg1.z, arg2.z, arg3.z);
	target.w = _func(src.w, arg1.w, arg2.w, arg3.w);
	return target;
};
const VECTOR4_FUNC_5: MathArrayVectorElementFunction5<Vector4> = (
	_func: MathFunction5,
	src: Vector4,
	arg1: Vector4,
	arg2: Vector4,
	arg3: Vector4,
	arg4: Vector4,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x, arg1.x, arg2.x, arg3.x, arg4.x);
	target.y = _func(src.y, arg1.y, arg2.y, arg3.y, arg4.y);
	target.z = _func(src.z, arg1.z, arg2.z, arg3.z, arg4.z);
	target.w = _func(src.w, arg1.w, arg2.w, arg3.w, arg4.w);
	return target;
};

// float
export class mathFloat_1 extends MathNamedFunction2<[MathFunction1, number]> {
	static override type() {
		return 'mathFloat_1';
	}
	func(_func: MathFunction1, value: number): number {
		return _func(value);
	}
}
export class mathFloat_2 extends MathNamedFunction3<[MathFunction2, number, number]> {
	static override type() {
		return 'mathFloat_2';
	}
	func(_func: MathFunction2, value: number, arg1: number): number {
		return _func(value, arg1);
	}
}
export class mathFloat_3 extends MathNamedFunction4<[MathFunction3, number, number, number]> {
	static override type() {
		return 'mathFloat_3';
	}
	func(_func: MathFunction3, value: number, arg1: number, arg2: number): number {
		return _func(value, arg1, arg2);
	}
}
export class mathFloat_4 extends MathNamedFunction5<[MathFunction4, number, number, number, number]> {
	static override type() {
		return 'mathFloat_4';
	}
	func(_func: MathFunction4, value: number, arg1: number, arg2: number, arg3: number): number {
		return _func(value, arg1, arg2, arg3);
	}
}
export class mathFloat_5 extends MathNamedFunction6<[MathFunction5, number, number, number, number, number]> {
	static override type() {
		return 'mathFloat_5';
	}
	func(_func: MathFunction5, value: number, arg1: number, arg2: number, arg3: number, arg4: number): number {
		return _func(value, arg1, arg2, arg3, arg4);
	}
}
// Color
export class mathColor_1 extends MathNamedFunction3<[MathFunction1, Color, Color]> {
	static override type() {
		return 'mathColor_1';
	}
	func = COLOR_FUNC_1;
}
export class mathColor_2 extends MathNamedFunction4<[MathFunction2, Color, Color, Color]> {
	static override type() {
		return 'mathColor_2';
	}
	func = COLOR_FUNC_2;
}
export class mathColor_3 extends MathNamedFunction5<[MathFunction2, Color, Color, Color, Color]> {
	static override type() {
		return 'mathColor_3';
	}
	func = COLOR_FUNC_3;
}
export class mathColor_3vvf extends MathNamedFunction5<[MathFunction2, Color, Color, number, Color]> {
	static override type() {
		return 'mathColor_3vvf';
	}
	func = COLOR_FUNC_3VVF;
}
export class mathColor_4 extends MathNamedFunction6<[MathFunction2, Color, Color, Color, Color, Color]> {
	static override type() {
		return 'mathColor_4';
	}
	func = COLOR_FUNC_4;
}
export class mathColor_5 extends MathNamedFunction7<[MathFunction2, Color, Color, Color, Color, Color, Color]> {
	static override type() {
		return 'mathColor_5';
	}
	func = COLOR_FUNC_5;
}
// Vector2
export class mathVector2_1 extends MathNamedFunction3<[MathFunction1, Vector2, Vector2]> {
	static override type() {
		return 'mathVector2_1';
	}
	func = VECTOR2_FUNC_1;
}
export class mathVector2_2 extends MathNamedFunction4<[MathFunction1, Vector2, Vector2, Vector2]> {
	static override type() {
		return 'mathVector2_2';
	}
	func = VECTOR2_FUNC_2;
}
export class mathVector2_3 extends MathNamedFunction5<[MathFunction1, Vector2, Vector2, Vector2, Vector2]> {
	static override type() {
		return 'mathVector2_3';
	}
	func = VECTOR2_FUNC_3;
}
export class mathVector2_3vvf extends MathNamedFunction5<[MathFunction1, Vector2, Vector2, number, Vector2]> {
	static override type() {
		return 'mathVector2_3vvf';
	}
	func = VECTOR2_FUNC_3VVF;
}
export class mathVector2_4 extends MathNamedFunction6<[MathFunction1, Vector2, Vector2, Vector2, Vector2, Vector2]> {
	static override type() {
		return 'mathVector2_4';
	}
	func = VECTOR2_FUNC_4;
}
export class mathVector2_5 extends MathNamedFunction7<
	[MathFunction1, Vector2, Vector2, Vector2, Vector2, Vector2, Vector2]
> {
	static override type() {
		return 'mathVector2_5';
	}
	func = VECTOR2_FUNC_5;
}
// Vector3
export class mathVector3_1 extends MathNamedFunction3<[MathFunction1, Vector3, Vector3]> {
	static override type() {
		return 'mathVector3_1';
	}
	func = VECTOR3_FUNC_1;
}
export class mathVector3_2 extends MathNamedFunction4<[MathFunction1, Vector3, Vector3, Vector3]> {
	static override type() {
		return 'mathVector3_2';
	}
	func = VECTOR3_FUNC_2;
}
export class mathVector3_3 extends MathNamedFunction5<[MathFunction1, Vector3, Vector3, Vector3, Vector3]> {
	static override type() {
		return 'mathVector3_3';
	}
	func = VECTOR3_FUNC_3;
}
export class mathVector3_3vvf extends MathNamedFunction5<[MathFunction1, Vector3, Vector3, number, Vector3]> {
	static override type() {
		return 'mathVector3_3vvf';
	}
	func = VECTOR3_FUNC_3VVF;
}
export class mathVector3_4 extends MathNamedFunction6<[MathFunction1, Vector3, Vector3, Vector3, Vector3, Vector3]> {
	static override type() {
		return 'mathVector3_4';
	}
	func = VECTOR3_FUNC_4;
}
export class mathVector3_5 extends MathNamedFunction7<
	[MathFunction1, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3]
> {
	static override type() {
		return 'mathVector3_5';
	}
	func = VECTOR3_FUNC_5;
}
// Vector4
export class mathVector4_1 extends MathNamedFunction3<[MathFunction1, Vector4, Vector4]> {
	static override type() {
		return 'mathVector4_1';
	}
	func = VECTOR4_FUNC_1;
}
export class mathVector4_2 extends MathNamedFunction4<[MathFunction1, Vector4, Vector4, Vector4]> {
	static override type() {
		return 'mathVector4_2';
	}
	func = VECTOR4_FUNC_2;
}
export class mathVector4_3 extends MathNamedFunction5<[MathFunction1, Vector4, Vector4, Vector4, Vector4]> {
	static override type() {
		return 'mathVector4_3';
	}
	func = VECTOR4_FUNC_3;
}
export class mathVector4_3vvf extends MathNamedFunction5<[MathFunction1, Vector4, Vector4, number, Vector4]> {
	static override type() {
		return 'mathVector4_3vvf';
	}
	func = VECTOR4_FUNC_3VVF;
}
export class mathVector4_4 extends MathNamedFunction6<[MathFunction1, Vector4, Vector4, Vector4, Vector4, Vector4]> {
	static override type() {
		return 'mathVector4_4';
	}
	func = VECTOR4_FUNC_4;
}
export class mathVector4_5 extends MathNamedFunction7<
	[MathFunction1, Vector4, Vector4, Vector4, Vector4, Vector4, Vector4]
> {
	static override type() {
		return 'mathVector4_5';
	}
	func = VECTOR4_FUNC_5;
}

// Prim Array
export class mathPrimArray_1 extends MathNamedFunction3<[MathFunction1, number[], number[]]> {
	static override type() {
		return 'mathPrimArray_1';
	}
	func(_func: MathFunction1, srcElements: number[], targetElements: number[]): number[] {
		_matchArrayLength(srcElements, targetElements, () => (srcElements[0] != null ? srcElements[0] : 0));
		let i = 0;
		for (let src of srcElements) {
			targetElements[i] = _func(src);
			i++;
		}
		return targetElements;
	}
}
export class mathPrimArray_2 extends MathNamedFunction4<[MathFunction2, number[], number, number[]]> {
	static override type() {
		return 'mathPrimArray_2';
	}
	func(_func: MathFunction2, srcElements: number[], arg1: number, targetElements: number[]): number[] {
		_matchArrayLength(srcElements, targetElements, () => (srcElements[0] != null ? srcElements[0] : 0));
		let i = 0;
		for (let src of srcElements) {
			targetElements[i] = _func(src, arg1);
			i++;
		}
		return targetElements;
	}
}
export class mathPrimArray_3 extends MathNamedFunction5<[MathFunction3, number[], number, number, number[]]> {
	static override type() {
		return 'mathPrimArray_3';
	}
	func(_func: MathFunction3, srcElements: number[], arg1: number, arg2: number, targetElements: number[]): number[] {
		_matchArrayLength(srcElements, targetElements, () => (srcElements[0] != null ? srcElements[0] : 0));
		let i = 0;
		for (let src of srcElements) {
			targetElements[i] = _func(src, arg1, arg2);
			i++;
		}
		return targetElements;
	}
}
export class mathPrimArray_4 extends MathNamedFunction6<[MathFunction4, number[], number, number, number, number[]]> {
	static override type() {
		return 'mathPrimArray_4';
	}
	func(
		_func: MathFunction4,
		srcElements: number[],
		arg1: number,
		arg2: number,
		arg3: number,
		targetElements: number[]
	): number[] {
		_matchArrayLength(srcElements, targetElements, () => (srcElements[0] != null ? srcElements[0] : 0));
		let i = 0;
		for (let src of srcElements) {
			targetElements[i] = _func(src, arg1, arg2, arg3);
			i++;
		}
		return targetElements;
	}
}
export class mathPrimArray_5 extends MathNamedFunction7<
	[MathFunction5, number[], number, number, number, number, number[]]
> {
	static override type() {
		return 'mathPrimArray_5';
	}
	func(
		_func: MathFunction5,
		srcElements: number[],
		arg1: number,
		arg2: number,
		arg3: number,
		arg4: number,
		targetElements: number[]
	): number[] {
		_matchArrayLength(srcElements, targetElements, () => (srcElements[0] != null ? srcElements[0] : 0));
		let i = 0;
		for (let src of srcElements) {
			targetElements[i] = _func(src, arg1, arg2, arg3, arg4);
			i++;
		}
		return targetElements;
	}
}
// Vector Array
export class mathVectorArray_1<T extends MathArrayVectorElement> extends MathNamedFunction4<
	[MathFunction1, MathArrayVectorElementFunction1<T>, T[], T[]]
> {
	static override type() {
		return 'mathVectorArray_1';
	}
	func(
		_func: MathFunction1,
		vectorFunc: MathArrayVectorElementFunction1<T>,
		srcElements: T[],
		targetElements: T[]
	): T[] {
		_matchArrayLength(srcElements, targetElements, () => srcElements[0].clone());
		let i = 0;
		for (let src of srcElements) {
			const target = targetElements[i];
			vectorFunc(_func, src, target);
			i++;
		}
		return targetElements;
	}
}
export class mathVectorArray_2<T extends MathArrayVectorElement> extends MathNamedFunction5<
	[MathFunction2, MathArrayVectorElementFunction2<T>, T[], T, T[]]
> {
	static override type() {
		return 'mathVectorArray_2';
	}
	func(
		_func: MathFunction2,
		vectorFunc: MathArrayVectorElementFunction2<T>,
		srcElements: T[],
		arg1: T,
		targetElements: T[]
	): T[] {
		_matchArrayLength(srcElements, targetElements, () => srcElements[0].clone());
		let i = 0;
		for (let src of srcElements) {
			const target = targetElements[i];
			vectorFunc(_func, src, arg1, target);
			i++;
		}
		return targetElements;
	}
}
export class mathVectorArray_3<T extends MathArrayVectorElement> extends MathNamedFunction6<
	[MathFunction3, MathArrayVectorElementFunction3<T>, T[], T, T, T[]]
> {
	static override type() {
		return 'mathVectorArray_3';
	}
	func(
		_func: MathFunction3,
		vectorFunc: MathArrayVectorElementFunction3<T>,
		srcElements: T[],
		arg1: T,
		arg2: T,
		targetElements: T[]
	): T[] {
		_matchArrayLength(srcElements, targetElements, () => srcElements[0].clone());
		let i = 0;
		for (let src of srcElements) {
			const target = targetElements[i];
			vectorFunc(_func, src, arg1, arg2, target);
			i++;
		}
		return targetElements;
	}
}
export class mathVectorArray_4<T extends MathArrayVectorElement> extends MathNamedFunction7<
	[MathFunction4, MathArrayVectorElementFunction4<T>, T[], T, T, T, T[]]
> {
	static override type() {
		return 'mathVectorArray_4';
	}
	func(
		_func: MathFunction4,
		vectorFunc: MathArrayVectorElementFunction4<T>,
		srcElements: T[],
		arg1: T,
		arg2: T,
		arg3: T,
		targetElements: T[]
	): T[] {
		_matchArrayLength(srcElements, targetElements, () => srcElements[0].clone());
		let i = 0;
		for (let src of srcElements) {
			const target = targetElements[i];
			vectorFunc(_func, src, arg1, arg2, arg3, target);
			i++;
		}
		return targetElements;
	}
}

export class mathVectorArray_5<T extends MathArrayVectorElement> extends MathNamedFunction8<
	[MathFunction5, MathArrayVectorElementFunction5<T>, T[], T, T, T, T, T[]]
> {
	static override type() {
		return 'mathVectorArray_5';
	}
	func(
		_func: MathFunction5,
		vectorFunc: MathArrayVectorElementFunction5<T>,
		srcElements: T[],
		arg1: T,
		arg2: T,
		arg3: T,
		arg4: T,
		targetElements: T[]
	): T[] {
		_matchArrayLength(srcElements, targetElements, () => srcElements[0].clone());
		let i = 0;
		for (let src of srcElements) {
			const target = targetElements[i];
			vectorFunc(_func, src, arg1, arg2, arg3, arg4, target);
			i++;
		}
		return targetElements;
	}
}
