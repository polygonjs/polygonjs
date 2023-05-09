import {Vector2, Vector3, Vector4} from 'three';
import {_matchArrayLength} from './_ArrayUtils';
import {NamedFunction1, NamedFunction2} from './_Base';

export class lengthVector<V extends Vector2 | Vector3 | Vector4> extends NamedFunction1<[V]> {
	static override type() {
		return 'lengthVector';
	}
	func(src: V): number {
		return src.length();
	}
}

export class lengthVectorArray<V extends Vector2 | Vector3 | Vector4> extends NamedFunction2<
	[Array<V>, Array<number>]
> {
	static override type() {
		return 'lengthVectorArray';
	}
	func(src: V[], target: number[]): number[] {
		_matchArrayLength(src, target, () => 0);
		let i = 0;
		for (let v of src) {
			target[i] = v.length();
			i++;
		}
		return target;
	}
}
