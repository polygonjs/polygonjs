import {Vector2, Vector3} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';

export class crossVector2 extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'crossVector2';
	}
	func(v1: Vector2, v2: Vector2): number {
		return v1.cross(v2);
	}
}

export class crossVector3 extends NamedFunction3<[Vector3, Vector3, Vector3]> {
	static override type() {
		return 'crossVector3';
	}
	func(v1: Vector3, v2: Vector3, target: Vector3): Vector3 {
		return target.copy(v1).cross(v2);
	}
}

// export class crossVectorArray<V extends Vector2|Vector3> extends NamedFunction2<[Array<V>,Array<number>]> {
// 	static override type() {
// 		return 'lengthVectorArray';
// 	}
// 	func(src: V[],target:number[]): number[] {
// 		_matchArrayLength(src,target,()=>0)
// 		let i=0
// 		for(let v of src){
// 			target[i]=v.length()
// 			i++
// 		}
// 		return target
// 	}
// }
