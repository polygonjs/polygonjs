import {BufferGeometry, BufferAttribute, Matrix4, Vector3, Quaternion} from 'three';
import type {geometries} from '@jscad/modeling';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {csgMaterialLine} from '../CsgConstant';
import {CSGTesselationParams} from '../CsgCommon';
const matrix = new Matrix4();
const t = new Vector3();
const q = new Quaternion();
const s = new Vector3();

export function path2ToObject3D(csg: geometries.path2.Path2, tesselationParams: CSGTesselationParams) {
	const geometry = path2ToBufferGeometry(csg);
	return BaseSopOperation.createObject(
		geometry,
		ObjectType.LINE_SEGMENTS,
		csgMaterialLine(tesselationParams.linesColor)
	);
}

export function path2ToBufferGeometry(csg: geometries.path2.Path2) {
	const vertices: number[] = [];
	// const colors: number[] = [];
	const indices: number[] = [];
	const points2D = csg.points;
	// const color = csg.color || [1, 1, 1];
	let i = 0;
	for (let point of points2D) {
		vertices.push(point[0], 0, point[1]);
		// colors.push(...color);
		if (i != 0) {
			indices.push(i - 1);
			indices.push(i);
		}
		i++;
	}

	const geo = new BufferGeometry();
	geo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
	geo.setIndex(indices);

	matrix.elements = csg.transforms;
	// remove the translate y of the matrix
	matrix.decompose(t, q, s);
	t.y = 0;
	matrix.compose(t, q, s);
	geo.applyMatrix4(matrix);

	return geo;
}

export function path2Positions(csg: geometries.path2.Path2): Vector3[] {
	const points = csg.points;
	const vectors: Vector3[] = new Array(points.length);
	let i = 0;
	for (let pt of points) {
		const vec = new Vector3();
		vec.x = pt[0];
		vec.y = 0;
		vec.z = pt[1];
		vectors[i] = vec;
		i++;
	}
	return vectors;
}
