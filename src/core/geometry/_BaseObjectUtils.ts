import {AttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Color, Vector2, Vector3, Vector4} from 'three';

export type AttributeDictionary = PolyDictionary<AttribValue>;
export function attribValueNonPrimitive(src: AttribValue) {
	return src instanceof Color || src instanceof Vector2 || src instanceof Vector3 || src instanceof Vector4;
}
export function copyAttribValue(src: AttribValue, target: AttribValue) {
	if (target instanceof Color && src instanceof Color) {
		target.copy(src);
	}
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

export function cloneAttribValue(src: AttribValue) {
	if (src instanceof Color) {
		return src.clone();
	}
	if (src instanceof Vector2) {
		return src.clone();
	}
	if (src instanceof Vector3) {
		return src.clone();
	}
	if (src instanceof Vector4) {
		return src.clone();
	}
}
