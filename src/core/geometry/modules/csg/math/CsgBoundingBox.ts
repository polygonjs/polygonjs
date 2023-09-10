import {Box3, Vector3, Matrix4} from 'three';
import {geometries} from '@jscad/modeling';
export type CsgGeometry = geometries.path2.Path2 | geometries.geom2.Geom2 | geometries.geom3.Geom3;

const _min = new Vector3();
const _max = new Vector3();
const _mat4 = new Matrix4();

export function csgBoundingBoxPath2(geometry: geometries.path2.Path2, target: Box3) {
	const points = geometry.points;

	// init
	if (points.length != 0) {
		const firstPoint = points[0];
		_min.set(firstPoint[0], 0, firstPoint[1]);
		_max.copy(_min);
	}

	// compute
	for (let vertex of points) {
		_min.x = Math.min(_min.x, vertex[0]);
		_min.y = Math.min(_min.z, vertex[1]);
		_max.x = Math.max(_max.x, vertex[0]);
		_max.y = Math.max(_max.z, vertex[1]);
	}

	target.min.copy(_min);
	target.max.copy(_max);

	_mat4.elements = geometry.transforms;
	target.applyMatrix4(_mat4);
}

export function csgBoundingBoxGeom2(geometry: geometries.geom2.Geom2, target: Box3) {
	const sides = geometry.sides;

	// init
	if (sides.length != 0) {
		const firstSide = sides[0];
		const firstVertex = firstSide[0];
		_min.set(firstVertex[0], 0, firstVertex[1]);
		_max.copy(_min);
	}

	// compute
	for (let side of sides) {
		for (let vertex of side) {
			_min.x = Math.min(_min.x, vertex[0]);
			_min.y = Math.min(_min.z, vertex[1]);
			_max.x = Math.max(_max.x, vertex[0]);
			_max.y = Math.max(_max.z, vertex[1]);
		}
	}

	target.min.copy(_min);
	target.max.copy(_max);

	_mat4.elements = geometry.transforms;
	target.applyMatrix4(_mat4);
}

export function csgBoundingBoxGeom3(geometry: geometries.geom3.Geom3, target: Box3) {
	const polygons = geometry.polygons;

	// init
	if (polygons.length != 0) {
		const firstPolygon = polygons[0];
		const vertices = firstPolygon.vertices;
		if (vertices.length != 0) {
			const firstVertex = vertices[0];
			_min.set(firstVertex[0], firstVertex[1], firstVertex[2]);
			_max.copy(_min);
		}
	}

	// compute
	for (let polygon of polygons) {
		const vertices = polygon.vertices;
		for (let vertex of vertices) {
			_min.x = Math.min(_min.x, vertex[0]);
			_min.y = Math.min(_min.y, vertex[1]);
			_min.z = Math.min(_min.z, vertex[2]);
			_max.x = Math.max(_max.x, vertex[0]);
			_max.y = Math.max(_max.y, vertex[1]);
			_max.z = Math.max(_max.z, vertex[2]);
		}
	}
	target.min.copy(_min);
	target.max.copy(_max);

	_mat4.elements = geometry.transforms;
	target.applyMatrix4(_mat4);
}
