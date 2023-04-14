import {NamedFunction3} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {Color, Vector2, Vector3, Vector4} from 'three';

type PreviousValueAcceptedType = boolean | number | string | Color | Vector2 | Vector3 | Vector4;
const arrayByLengthByNodePath: Map<string, Map<number, PreviousValueAcceptedType[]>> = new Map();

function _getArray<T extends PreviousValueAcceptedType>(
	nodePath: string,
	arrayLength: number,
	createElement: () => T
): T[] {
	let mapForNodePath = arrayByLengthByNodePath.get(nodePath);
	if (!mapForNodePath) {
		mapForNodePath = new Map();
		arrayByLengthByNodePath.set(nodePath, mapForNodePath);
	}
	let array = mapForNodePath.get(arrayLength);
	if (!array) {
		array = new Array(arrayLength) as T[];
		for (let i = 0; i < arrayLength; i++) {
			array[i] = createElement();
		}
		mapForNodePath.set(arrayLength, array);
	}
	return array as T[];
}

export class previousValuePrimitive<T extends boolean | number | string> extends NamedFunction3<[string, number, T]> {
	static override type() {
		return 'previousValuePrimitive';
	}
	override func(nodePath: string, offset: number, newValue: T): T {
		const arrayLength = offset + 1;
		const array = _getArray(nodePath, arrayLength, () => newValue);
		for (let i = 0; i < arrayLength - 1; i++) {
			array[i] = array[i + 1];
		}
		array[arrayLength - 1] = newValue;
		console.log(array);
		return array[0];
	}
}

export class previousValueColor extends NamedFunction3<[string, number, Color]> {
	static override type() {
		return 'previousValueColor';
	}
	override func(nodePath: string, offset: number, newValue: Color): Color {
		const arrayLength = offset + 1;
		const array = _getArray<Color>(nodePath, arrayLength, () => newValue.clone());
		for (let i = 0; i < arrayLength - 1; i++) {
			array[i].copy(array[i + 1]);
		}
		array[arrayLength - 1].copy(newValue);
		return array[0];
	}
}
export class previousValueVector2 extends NamedFunction3<[string, number, Vector2]> {
	static override type() {
		return 'previousValueVector2';
	}
	override func(nodePath: string, offset: number, newValue: Vector2): Vector2 {
		const arrayLength = offset + 1;
		const array = _getArray<Vector2>(nodePath, arrayLength, () => newValue.clone());
		for (let i = 0; i < arrayLength - 1; i++) {
			array[i].copy(array[i + 1]);
		}
		array[arrayLength - 1].copy(newValue);
		return array[0];
	}
}
export class previousValueVector3 extends NamedFunction3<[string, number, Vector3]> {
	static override type() {
		return 'previousValueVector3';
	}
	override func(nodePath: string, offset: number, newValue: Vector3): Vector3 {
		const arrayLength = offset + 1;
		const array = _getArray<Vector3>(nodePath, arrayLength, () => newValue.clone());
		for (let i = 0; i < arrayLength - 1; i++) {
			array[i].copy(array[i + 1]);
		}
		array[arrayLength - 1].copy(newValue);
		return array[0];
	}
}
export class previousValueVector4 extends NamedFunction3<[string, number, Vector4]> {
	static override type() {
		return 'previousValueVector4';
	}
	override func(nodePath: string, offset: number, newValue: Vector4): Vector4 {
		const arrayLength = offset + 1;
		const array = _getArray<Vector4>(nodePath, arrayLength, () => newValue.clone());
		for (let i = 0; i < arrayLength - 1; i++) {
			array[i].copy(array[i + 1]);
		}
		array[arrayLength - 1].copy(newValue);
		return array[0];
	}
}
