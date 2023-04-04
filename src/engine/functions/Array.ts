import {BaseNamedFunction} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {PrimitiveArrayElement, VectorArrayElement} from '../nodes/utils/io/connections/Js';
import {Vector4} from 'three';

//
//
//  Array Props
//
//
export class arrayLength extends BaseNamedFunction {
	static override type() {
		return 'arrayLength';
	}
	override func(array: Array<any>): number {
		return array.length;
	}
	override asString(elements: string): string {
		super.asString(elements);
		return `${this.type()}(${[elements].join(', ')})`;
	}
}

//
//
// To Array
//
//
export class elementsToArrayPrimitive<T extends PrimitiveArrayElement> extends BaseNamedFunction {
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
	override asString(elements: string, target: string): string {
		super.asString(elements, target);
		return `${this.type()}(${[elements, target].join(', ')})`;
	}
}
export class elementsToArrayVector<T extends VectorArrayElement> extends BaseNamedFunction {
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
	override asString(elements: string, target: string): string {
		super.asString(elements, target);
		return `${this.type()}(${[elements, target].join(', ')})`;
	}
}

//
//
// From Array
//
//
export class arrayElementPrimitive<T extends PrimitiveArrayElement> extends BaseNamedFunction {
	static override type() {
		return 'arrayElementPrimitive';
	}
	override func(src: Array<T>, index: number): T {
		const element = src[index];
		return element != null ? element : src[0];
	}
	override asString(src: string, index: string): string {
		super.asString(src, index);
		return `${this.type()}(${[src, index].join(', ')})`;
	}
}
export class arrayElementVector extends BaseNamedFunction {
	static override type() {
		return 'arrayElementVector';
	}
	override func<T extends VectorArrayElement>(src: Array<T>, index: number, target: T): T {
		let element: T = src[index];
		element != null ? element : src[0];
		console.log({src, index, element, target});
		(target as Vector4).copy(element as Vector4);
		return target;
	}
	override asString(src: string, index: string, target: string): string {
		super.asString(src, target);
		return `${this.type()}(${[src, index, target].join(', ')})`;
	}
}
