import {NamedFunction1, NamedFunction2, NamedFunction3} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {PrimitiveArrayElement, VectorArrayElement} from '../nodes/utils/io/connections/Js';
import {Vector4} from 'three';

//
//
//  Array Props
//
//
export class arrayLength extends NamedFunction1<[Array<any>]> {
	static override type() {
		return 'arrayLength';
	}
	override func(array: Array<any>): number {
		return array.length;
	}
}

//
//
// To Array
//
//
export class elementsToArrayPrimitive<T extends PrimitiveArrayElement> extends NamedFunction2<[Array<T>, Array<T>]> {
	static override type() {
		return 'elementsToArrayPrimitive';
	}
	override func(src: Array<T>, target: Array<T>): Array<T> {
		_matchArrayLength(src, target, () => src[0]);
		let i = 0;
		for (let srcElement of src) {
			target[i] = srcElement;
			i++;
		}
		return target;
	}
}
export class elementsToArrayVector<T extends VectorArrayElement> extends NamedFunction2<[Array<T>, Array<T>]> {
	static override type() {
		return 'elementsToArrayVector';
	}
	override func(src: Array<T>, target: Array<T>): Array<T> {
		_matchArrayLength(src, target, () => src[0].clone());
		let i = 0;
		for (let srcElement of src) {
			(target[i] as Vector4).copy(srcElement as Vector4);
			i++;
		}
		return target;
	}
}

//
//
// From Array
//
//
export class arrayElementPrimitive<T extends PrimitiveArrayElement> extends NamedFunction2<[Array<T>, number]> {
	static override type() {
		return 'arrayElementPrimitive';
	}
	override func(src: Array<T>, index: number): T {
		const element = src[index];
		return element != null ? element : src[0];
	}
}

export class arrayElementVector<T extends VectorArrayElement> extends NamedFunction3<[Array<T>, number, T]> {
	static override type() {
		return 'arrayElementVector';
	}
	override func(src: Array<T>, index: number, target: T): T {
		let element: T = src[index];
		element != null ? element : src[0];
		if (element) {
			(target as Vector4).copy(element as Vector4);
		}
		return target;
	}
}
//
//
// Pop
//
//
export class arrayPopPrimitive<T extends PrimitiveArrayElement> extends NamedFunction1<[Array<T>]> {
	static override type() {
		return 'arrayPopPrimitive';
	}
	override func(src: Array<T>): T | undefined {
		const element = src.pop();
		return element;
	}
}
export class arrayPopVector<T extends VectorArrayElement> extends NamedFunction2<[Array<T>, T]> {
	static override type() {
		return 'arrayPopVector';
	}
	override func(src: Array<T>, target: T): T {
		const element = src.pop();
		if (element) {
			(target as Vector4).copy(element as Vector4);
		}
		return target;
	}
}

//
//
// Shift
//
//
export class arrayShiftPrimitive<T extends PrimitiveArrayElement> extends NamedFunction1<[Array<T>]> {
	static override type() {
		return 'arrayShiftPrimitive';
	}
	override func(src: Array<T>): T | undefined {
		const element = src.shift();
		return element;
	}
}
export class arrayShiftVector<T extends VectorArrayElement> extends NamedFunction2<[Array<T>, T]> {
	static override type() {
		return 'arrayShiftVector';
	}
	override func(src: Array<T>, target: T): T {
		const element = src.shift();
		if (element) {
			(target as Vector4).copy(element as Vector4);
		}
		return target;
	}
}
