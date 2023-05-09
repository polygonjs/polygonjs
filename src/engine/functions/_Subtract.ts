import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction, NamedFunction2} from './_Base';

export class subtractNumber extends NamedFunction<Array<number>, Array<string>> {
	static override type() {
		return 'subtractNumber';
	}
	func(...args: Array<number>): number {
		let first = args[0];
		for (let i = 1; i < args.length; i++) {
			first -= args[i];
		}
		return first;
	}
}

type AvailableItem = Vector2 | Vector3 | Vector4;
export class subtractVector<V extends AvailableItem> extends NamedFunction<Array<V>, Array<string>> {
	static override type() {
		return 'subtractVector';
	}
	func(...args: Array<V>): V {
		const first: V = args[0];
		for (let i = 1; i < args.length; i++) {
			first.sub(args[i] as any);
		}
		return first;
	}
}

export class subtractVectorNumber<V extends AvailableItem> extends NamedFunction2<[V, number]> {
	static override type() {
		return 'subtractVectorNumber';
	}
	func(vector: V, number: number): V {
		return vector.subScalar(number) as V;
	}
}
