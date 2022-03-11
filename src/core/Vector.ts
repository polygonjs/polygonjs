import {Vector2} from 'three/src/math/Vector2';

export class CoreVector {
	static isVector2Valid(vector: Vector2): boolean {
		return !isNaN(vector.x) && !isNaN(vector.y) && isFinite(vector.x) && isFinite(vector.y);
	}
}
