import {Color, Vector2, Vector3, Vector4, Quaternion} from 'three';
import {mix} from '../../core/math/_Module';
import {NamedFunction3, NamedFunction4} from './_Base';

export class lerpNumber extends NamedFunction3<[number, number, number]> {
	static override type() {
		return 'lerpNumber';
	}
	func(v1: number, v2: number, lerp: number): number {
		return mix(v1, v2, lerp);
	}
}

export class lerpColor extends NamedFunction4<[Color, Color, number, Color]> {
	static override type() {
		return 'lerpColor';
	}
	func(v1: Color, v2: Color, lerp: number, target: Color): Color {
		return target.copy(v1).lerp(v2, lerp);
	}
}
export class lerpQuaternion extends NamedFunction4<[Quaternion, Quaternion, number, Quaternion]> {
	static override type() {
		return 'lerpQuaternion';
	}
	func(v1: Quaternion, v2: Quaternion, lerp: number, target: Quaternion): Quaternion {
		return target.copy(v1).slerp(v2, lerp);
	}
}
export class lerpVector2 extends NamedFunction4<[Vector2, Vector2, number, Vector2]> {
	static override type() {
		return 'lerpVector2';
	}
	func(v1: Vector2, v2: Vector2, lerp: number, target: Vector2): Vector2 {
		return target.copy(v1).lerp(v2, lerp);
	}
}
export class lerpVector3 extends NamedFunction4<[Vector3, Vector3, number, Vector3]> {
	static override type() {
		return 'lerpVector3';
	}
	func(v1: Vector3, v2: Vector3, lerp: number, target: Vector3): Vector3 {
		return target.copy(v1).lerp(v2, lerp);
	}
}
export class lerpVector4 extends NamedFunction4<[Vector4, Vector4, number, Vector4]> {
	static override type() {
		return 'lerpVector4';
	}
	func(v1: Vector4, v2: Vector4, lerp: number, target: Vector4): Vector4 {
		return target.copy(v1).lerp(v2, lerp);
	}
}

// export class multScalarVectorArray<V extends Color|Vector2|Vector3|Vector4> extends NamedFunction3<[Array<V>,number,Array<V>]> {
// 	static override type() {
// 		return 'multScalarVectorArray';
// 	}
// 	func(src: V[],scalar:number,target:V[]): V[] {
// 		_matchArrayLength(src,target,()=>src[0].clone())
// 		let i=0
// 		for(let v of src){
// 			(target[i] as Vector4).copy(v as Vector4).multiplyScalar(scalar);
// 			i++
// 		}
// 		return target
// 	}
// }
