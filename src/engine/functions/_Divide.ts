import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction, NamedFunction2} from './_Base';

export class divideNumber extends NamedFunction<Array<number>, Array<string>> {
	static override type() {
		return 'divideNumber';
	}
	func(...args: Array<number>): number {
		let first = args[0];
		for (let i = 1; i < args.length; i++) {
			first /= args[i];
		}
		return first;
	}
}

type AvailableItem = Vector2 | Vector3 | Vector4;
// export class divideVector<V extends AvailableItem> extends NamedFunction<Array<V>, Array<string>> {
// 	static override type() {
// 		return 'divideVector';
// 	}
// 	func(...args: Array<V>): V {
// 		const first: V = args[0];
// 		for (let i = 0; i < args.length; i++) {
// 			first.divideScalar(args[i] as any);
// 		}
// 		return first;
// 	}
// }

export class divideVectorNumber<V extends AvailableItem> extends NamedFunction2<[V, number]> {
	static override type() {
		return 'divideVectorNumber';
	}
	func(vector: V, number: number): V {
		return vector.divideScalar(number) as V;
	}
}
