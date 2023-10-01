import type {maths} from '@jscad/modeling';

export function csgVec3MultScalar(src: maths.vec3.Vec3, scalar: number) {
	src[0] *= scalar;
	src[1] *= scalar;
	src[2] *= scalar;
}

export function csgVec3ToJSON(src: maths.vec3.Vec3) {
	return src;
}
export function csgVec3sToJSON(src: maths.vec3.Vec3[]) {
	return src.map((v) => csgVec3ToJSON(v));
}
