import type {Vector2} from 'three';

export function isVector2Valid(vector: Vector2): boolean {
	return !isNaN(vector.x) && !isNaN(vector.y) && isFinite(vector.x) && isFinite(vector.y);
}
