import {AttribValue, NumericAttribValue} from '../../types/GlobalTypes';
import {Vector2, Vector3, Vector4} from 'three';
export abstract class CoreEntity {
	constructor(protected _index: number) {}
	index() {
		return this._index;
	}

	abstract setAttribValue(attribName: string, attribValue: NumericAttribValue | string): void;
	abstract attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue | undefined;
	abstract stringAttribValue(attribName: string): string | undefined;
	abstract position(target: Vector3): void;
}
