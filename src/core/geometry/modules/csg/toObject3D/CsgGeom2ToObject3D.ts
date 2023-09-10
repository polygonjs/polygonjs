import {BufferGeometry, BufferAttribute, Matrix4, Vector3, Quaternion} from 'three';
import type {geometries} from '@jscad/modeling';
import {ObjectType} from '../../../Constant';
import {BaseSopOperation} from '../../../../../engine/operations/sop/_Base';
import {csgMaterialLine} from '../CsgConstant';
import {CSGTesselationParams} from '../CsgCommon';
const matrix = new Matrix4();
const t = new Vector3();
const q = new Quaternion();
const s = new Vector3();

export function geom2ToObject3D(csg: geometries.geom2.Geom2, tesselationParams: CSGTesselationParams) {
	const geometry = geom2ToBufferGeometry(csg);
	return BaseSopOperation.createObject(
		geometry,
		ObjectType.LINE_SEGMENTS,
		csgMaterialLine(tesselationParams.linesColor)
	);
}

export function geom2ToBufferGeometry(csg: geometries.geom2.Geom2) {
	const vertices: number[] = [];
	// const colors: number[] = [];
	const indices: number[] = [];
	const sides = csg.sides;
	// const color = csg.color || [1, 1, 1];
	let i = 0;
	for (let side of sides) {
		const point0 = side[0];
		const point1 = side[1];
		vertices.push(point0[0], 0, point0[1]);
		vertices.push(point1[0], 0, point1[1]);
		// colors.push(...color);
		// colors.push(...color);
		// if (i != 0) {
		indices.push(i * 2);
		indices.push(i * 2 + 1);
		// }
		i++;
	}
	// add first point again
	// const d
	// const point = sides[0][0];
	// vertices.push(point[0], 0, point[1]);
	// indices.push(i - 1);
	// indices.push(i);

	const geo = new BufferGeometry();
	geo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
	// geo.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
	geo.setIndex(indices);

	matrix.elements = csg.transforms;
	// remove the translate y of the matrix
	matrix.decompose(t, q, s);
	t.y = 0;
	matrix.compose(t, q, s);
	geo.applyMatrix4(matrix);

	return geo;
}

export function geom2Positions(csg: geometries.geom2.Geom2): Vector3[] {
	const sides = csg.sides;
	const vectors: Vector3[] = new Array(sides.length);
	let i = 0;
	for (let side of sides) {
		const vec = new Vector3();
		const pt = side[0];
		vec.x = pt[0];
		vec.y = pt[1];
		vec.z = 0;
		vectors[i] = vec;
		i++;
	}
	return vectors;
}
