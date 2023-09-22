import {Matrix4, Vector3} from 'three';
import {CsgGeometry, CsgGeometryType} from '../CsgCommon';
import {csgGeometryTypeFromGeometry} from '../CsgCoreType';
import {maths, geometries} from '@jscad/modeling';
import {TypeAssert} from '../../../../../engine/poly/Assert';
const {mat4} = maths;

const TMP_MAT4 = new Matrix4();
const TMP_VEC3 = new Vector3();

/*
 * from jscad source, but with typescript
 */
const isIdentity = (matrix: maths.mat4.Mat4) =>
	matrix[0] === 1 &&
	matrix[1] === 0 &&
	matrix[2] === 0 &&
	matrix[3] === 0 &&
	matrix[4] === 0 &&
	matrix[5] === 1 &&
	matrix[6] === 0 &&
	matrix[7] === 0 &&
	matrix[8] === 0 &&
	matrix[9] === 0 &&
	matrix[10] === 1 &&
	matrix[11] === 0 &&
	matrix[12] === 0 &&
	matrix[13] === 0 &&
	matrix[14] === 0 &&
	matrix[15] === 1;
export function geom3ApplyTransforms(geom: geometries.geom3.Geom3) {
	if (isIdentity(geom.transforms)) return;

	TMP_MAT4.elements = geom.transforms;
	const polygons = geom.polygons;
	for (const polygon of polygons) {
		const vertices = polygon.vertices;
		for (const vertex of vertices) {
			transformVec3(vertex, TMP_MAT4);
		}
	}
	mat4.identity(geom.transforms);
}
export function path2ApplyTransforms(geom: geometries.path2.Path2) {
	if (isIdentity(geom.transforms)) return;

	TMP_MAT4.elements = geom.transforms;
	const points = geom.points;
	for (const point of points) {
		transformVec2(point, TMP_MAT4);
	}
	mat4.identity(geom.transforms);
}

// const vec2transform = (out, vector, matrix) => {
// 	const x = vector[0]
// 	const y = vector[1]
// 	out[0] = matrix[0] * x + matrix[4] * y + matrix[12]
// 	out[1] = matrix[1] * x + matrix[5] * y + matrix[13]
// 	return out
//   }

export function csgApplyTransform(csg: CsgGeometry) {
	const type = csgGeometryTypeFromGeometry(csg);
	switch (type) {
		case CsgGeometryType.PATH2: {
			return path2ApplyTransforms(csg as geometries.path2.Path2);
		}
		case CsgGeometryType.GEOM2: {
			return geom2ApplyTransforms(csg as geometries.geom2.Geom2);
		}
		case CsgGeometryType.GEOM3: {
			return geom3ApplyTransforms(csg as geometries.geom3.Geom3);
		}
	}
	TypeAssert.unreachable(type);
}

export function matrix4ToMat4(matrix4: Matrix4, target: maths.mat4.Mat4) {
	const elements = matrix4.elements;
	target[0] = elements[0];
	target[1] = elements[1];
	target[2] = elements[2];
	target[3] = elements[3];
	target[4] = elements[4];
	target[5] = elements[5];
	target[6] = elements[6];
	target[7] = elements[7];
	target[8] = elements[8];
	target[9] = elements[9];
	target[10] = elements[10];
	target[11] = elements[11];
	target[12] = elements[12];
	target[13] = elements[13];
	target[14] = elements[14];
	target[15] = elements[15];
}
// export function mat4Copy(src: maths.mat4.Mat4, target: maths.mat4.Mat4) {
// 	target[0] = src[0];
// 	target[1] = src[1];
// 	target[2] = src[2];
// 	target[3] = src[3];
// 	target[4] = src[4];
// 	target[5] = src[5];
// 	target[6] = src[6];
// 	target[7] = src[7];
// 	target[8] = src[8];
// 	target[9] = src[9];
// 	target[10] = src[10];
// 	target[11] = src[11];
// 	target[12] = src[12];
// 	target[13] = src[13];
// 	target[14] = src[14];
// 	target[15] = src[15];
// }

export function csgApplyMatrix4(csg: CsgGeometry, matrix4: Matrix4) {
	matrix4ToMat4(matrix4, csg.transforms);
	csgApplyTransform(csg);
}

function transformVec2(vec2: maths.vec2.Vec2, matrix4: Matrix4) {
	TMP_VEC3.x = vec2[0];
	TMP_VEC3.y = 0;
	TMP_VEC3.z = vec2[1];
	TMP_VEC3.applyMatrix4(matrix4);
	vec2[0] = TMP_VEC3.x;
	vec2[1] = TMP_VEC3.z;
}
function transformVec3(vec3: maths.vec3.Vec3, matrix4: Matrix4) {
	TMP_VEC3.x = vec3[0];
	TMP_VEC3.y = vec3[1];
	TMP_VEC3.z = vec3[2];
	TMP_VEC3.applyMatrix4(matrix4);
	vec3[0] = TMP_VEC3.x;
	vec3[1] = TMP_VEC3.y;
	vec3[2] = TMP_VEC3.z;
}
export function geom2ApplyTransforms(geom: geometries.geom2.Geom2) {
	if (isIdentity(geom.transforms)) {
		return;
	}

	// apply transforms to each side
	const sides = geom.sides;
	TMP_MAT4.elements = geom.transforms;
	for (const side of sides) {
		transformVec2(side[0], TMP_MAT4);
		transformVec2(side[1], TMP_MAT4);
	}
	mat4.identity(geom.transforms);
}
