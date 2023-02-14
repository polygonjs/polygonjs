import {Color, Vector2, Vector3} from 'three';
import type {maths, colors} from '@jscad/modeling';

export function csgVec3ToVector3(src: maths.vec3.Vec3, target: Vector3) {
	target.x = src[0];
	target.y = src[1];
	target.z = src[2];
}
export function vector3ToCsgVec3(src: Vector3, target: maths.vec3.Vec3) {
	target[0] = src.x;
	target[1] = src.y;
	target[2] = src.z;
}
export function vector2ToCsgVec2(src: Vector2, target: maths.vec2.Vec2) {
	target[0] = src.x;
	target[1] = src.y;
}
export function colorToCsgRGB(src: Color, target: colors.RGB) {
	target[0] = src.r;
	target[1] = src.g;
	target[2] = src.b;
}
