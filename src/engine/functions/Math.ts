// import {Vector2, Vector3, Vector4} from 'three';
// import {NamedFunction2} from './_Base';

import {Color, Vector2, Vector3, Vector4} from 'three';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';

type MathFunction = (x: number) => number;
type MathArrayVectorElement = Color | Vector2 | Vector3 | Vector4;
type MathArrayVectorElementFunction<T extends MathArrayVectorElement> = (func: MathFunction, src: T, target: T) => T;

const COLOR_FUNC: MathArrayVectorElementFunction<Color> = (_func: MathFunction, src: Color, target: Color): Color => {
	target.r = _func(src.r);
	target.g = _func(src.g);
	target.b = _func(src.b);
	return target;
};
const VECTOR2_FUNC: MathArrayVectorElementFunction<Vector2> = (
	_func: MathFunction,
	src: Vector2,
	target: Vector2
): Vector2 => {
	target.x = _func(src.x);
	target.y = _func(src.y);
	return target;
};
const VECTOR3_FUNC: MathArrayVectorElementFunction<Vector3> = (
	_func: MathFunction,
	src: Vector3,
	target: Vector3
): Vector3 => {
	target.x = _func(src.x);
	target.y = _func(src.y);
	target.z = _func(src.z);
	return target;
};
const VECTOR4_FUNC: MathArrayVectorElementFunction<Vector4> = (
	_func: MathFunction,
	src: Vector4,
	target: Vector4
): Vector4 => {
	target.x = _func(src.x);
	target.y = _func(src.y);
	target.z = _func(src.z);
	target.w = _func(src.w);
	return target;
};
// const FUNC_BY_ARRAY_ELEMENT:Record<MathArrayVectorElement, MathArrayVectorElementFunction<Vector2>>
// type MathVectorMap = {[key in MathArrayVectorElement]: MathArrayVectorElementFunction<key>};
// // export interface JsIConnectionPointTypeFromArrayTypeMap extends JsConnectionPointTypeFromArrayTypeMapGeneric {
// 	interface Map {
// 		Color: MathArrayVectorElementFunction<Color>
// 	}

export class mathFloat extends NamedFunction2<[MathFunction, number]> {
	static override type() {
		return 'mathFloat';
	}
	func(_func: MathFunction, value: number): number {
		return _func(value);
	}
}
export class mathColor extends NamedFunction3<[MathFunction, Color, Color]> {
	static override type() {
		return 'mathColor';
	}
	func = COLOR_FUNC;
}
export class mathVector2 extends NamedFunction3<[MathFunction, Vector2, Vector2]> {
	static override type() {
		return 'mathVector2';
	}
	func = VECTOR2_FUNC;
}
export class mathVector3 extends NamedFunction3<[MathFunction, Vector3, Vector3]> {
	static override type() {
		return 'mathVector3';
	}
	func = VECTOR3_FUNC;
}
export class mathVector4 extends NamedFunction3<[MathFunction, Vector4, Vector4]> {
	static override type() {
		return 'mathVector4';
	}
	func = VECTOR4_FUNC;
}

export class mathPrimArray extends NamedFunction3<[MathFunction, number[], number[]]> {
	static override type() {
		return 'mathPrimArray';
	}
	func(_func: MathFunction, srcElements: number[], targetElements: number[]): number[] {
		let i = 0;
		for (let src of srcElements) {
			targetElements[i] = _func(src);
			i++;
		}
		return targetElements;
	}
}
export class mathVectorArray<T extends MathArrayVectorElement> extends NamedFunction4<
	[MathFunction, MathArrayVectorElementFunction<T>, T[], T[]]
> {
	static override type() {
		return 'mathVectorArray';
	}
	func(
		_func: MathFunction,
		vectorFunc: MathArrayVectorElementFunction<T>,
		srcElements: T[],
		targetElements: T[]
	): T[] {
		let i = 0;
		for (let src of srcElements) {
			const target = targetElements[i];
			vectorFunc(_func, src, target);
			i++;
		}
		return targetElements;
	}
}
