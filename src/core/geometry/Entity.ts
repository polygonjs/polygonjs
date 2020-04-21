import {Vector4} from 'three/src/math/Vector4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
export abstract class CoreEntity {
	constructor(protected _index: number) {}
	get index() {
		return this._index;
	}

	abstract attrib_value(name: string, target?: Vector2 | Vector3 | Vector4): AttribValue;
	abstract string_attrib_value(name: string): string;
}
