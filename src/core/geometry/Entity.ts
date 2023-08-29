import {AttribValue, NumericAttribValue} from '../../types/GlobalTypes';
import {Vector2, Vector3, Vector4} from 'three';
export abstract class CoreEntity {
	protected _index: number = 0;
	// protected _content?: T;
	constructor(content?: any, index?: number) {
		// this._content = content;
		if (index != null) {
			this._index = index;
		}
	}
	// setContent(content: T) {
	// 	this._content = content;
	// }
	index() {
		return this._index;
	}
	setIndex(index: number) {
		this._index = index;
		return this;
	}

	abstract setAttribValue(attribName: string, attribValue: NumericAttribValue | string): void;
	abstract attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue | undefined;
	abstract stringAttribValue(attribName: string): string | undefined;
	abstract position(target: Vector3): void;
}
