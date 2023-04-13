import {Color, Vector2, Vector3, Vector4} from 'three';
import {_matchArrayLength} from './_ArrayUtils';
import {NamedFunction3} from './_Base';

export class multScalarColor extends NamedFunction3<[Color, number, Color]> {
	static override type() {
		return 'multScalarColor';
	}
	func(src: Color, scalar: number, target: Color): Color {
		return target.copy(src).multiplyScalar(scalar);
	}
}
export class multScalarVector2 extends NamedFunction3<[Vector2, number, Vector2]> {
	static override type() {
		return 'multScalarVector2';
	}
	func(src: Vector2, scalar: number, target: Vector2): Vector2 {
		return target.copy(src).multiplyScalar(scalar);
	}
}
export class multScalarVector3 extends NamedFunction3<[Vector3, number, Vector3]> {
	static override type() {
		return 'multScalarVector3';
	}
	func(src: Vector3, scalar: number, target: Vector3): Vector3 {
		return target.copy(src).multiplyScalar(scalar);
	}
}
export class multScalarVector4 extends NamedFunction3<[Vector4, number, Vector4]> {
	static override type() {
		return 'multScalarVector4';
	}
	func(src: Vector4, scalar: number, target: Vector4): Vector4 {
		return target.copy(src).multiplyScalar(scalar);
	}
}

export class multScalarVectorArray<V extends Color | Vector2 | Vector3 | Vector4> extends NamedFunction3<
	[Array<V>, number, Array<V>]
> {
	static override type() {
		return 'multScalarVectorArray';
	}
	func(src: V[], scalar: number, target: V[]): V[] {
		_matchArrayLength(src, target, () => src[0].clone());
		let i = 0;
		for (let v of src) {
			(target[i] as Vector4).copy(v as Vector4).multiplyScalar(scalar);
			i++;
		}
		return target;
	}
}
export class multScalarArrayVectorArray<V extends Color | Vector2 | Vector3 | Vector4> extends NamedFunction3<
	[Array<V>, number[], Array<V>]
> {
	static override type() {
		return 'multScalarArrayVectorArray';
	}
	func(src: V[], scalar: number[], target: V[]): V[] {
		_matchArrayLength(src, target, () => src[0].clone());
		let i = 0;
		for (let v of src) {
			(target[i] as Vector4).copy(v as Vector4).multiplyScalar(scalar[i]);
			i++;
		}
		return target;
	}
}
