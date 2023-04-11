import {AttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Vector2, Vector3, Vector4} from 'three';

export type AttributeDictionary = PolyDictionary<AttribValue>;
export function attribValueNonPrimitive(src: AttribValue) {
	return src instanceof Vector2 || src instanceof Vector3 || src instanceof Vector4;
}
export function copyAttribValue(src: AttribValue, target: AttribValue) {
	if (target instanceof Vector2 && src instanceof Vector2) {
		target.copy(src);
	}
	if (target instanceof Vector3 && src instanceof Vector3) {
		target.copy(src);
	}
	if (target instanceof Vector4 && src instanceof Vector4) {
		target.copy(src);
	}
}
