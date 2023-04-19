import {Intersection, Vector2, Vector3, Mesh, BufferGeometry, BufferAttribute, Triangle, Points} from 'three';
import {TypeAssert} from '../../../engine/poly/Assert';
import {AttribType, objectTypeFromConstructor, ObjectType} from '../Constant';
import {CoreGeometry} from '../Geometry';

const _vA = new Vector3();
const _vB = new Vector3();
const _vC = new Vector3();
const _uvA = new Vector2();
const _uvB = new Vector2();
const _uvC = new Vector2();
const _hitUV = new Vector2();

export function resolveIntersectGeometryAttribute(
	intersection: Intersection,
	attribName: string,
	attribType: AttribType
) {
	const objectType = objectTypeFromConstructor(intersection.object.constructor);
	switch (objectType) {
		case ObjectType.MESH:
			return resolveGeometryAttributeForMesh(intersection, attribName, attribType);
		case ObjectType.POINTS:
			return resolveGeometryAttributeForPoint(intersection, attribName, attribType);
	}
	// TODO: have the raycast cpu controller work with all object types
	// TypeAssert.unreachable(object_type)
}

function resolveGeometryAttributeForMesh(intersection: Intersection, attribName: string, attribType: AttribType) {
	const geometry = (intersection.object as Mesh).geometry as BufferGeometry;
	if (geometry) {
		const attribute = geometry.getAttribute(attribName) as BufferAttribute;
		if (attribute) {
			switch (attribType) {
				case AttribType.NUMERIC: {
					const position = geometry.getAttribute('position') as BufferAttribute;
					if (intersection.face) {
						_vA.fromBufferAttribute(position, intersection.face.a);
						_vB.fromBufferAttribute(position, intersection.face.b);
						_vC.fromBufferAttribute(position, intersection.face.c);
						_uvA.fromBufferAttribute(attribute, intersection.face.a);
						_uvB.fromBufferAttribute(attribute, intersection.face.b);
						_uvC.fromBufferAttribute(attribute, intersection.face.c);
						intersection.uv = Triangle.getUV(intersection.point, _vA, _vB, _vC, _uvA, _uvB, _uvC, _hitUV);
						return _hitUV.x;
					}
					return;
				}
				case AttribType.STRING: {
					const coreGeometry = new CoreGeometry(geometry);
					const corePoint = coreGeometry.points()[0];
					if (corePoint) {
						return corePoint.stringAttribValue(attribName);
					}
					return;
				}
			}
			TypeAssert.unreachable(attribType);
		}
	}
}
function resolveGeometryAttributeForPoint(intersection: Intersection, attribName: string, attribType: AttribType) {
	const geometry = (intersection.object as Points).geometry as BufferGeometry;
	if (geometry && intersection.index != null) {
		switch (attribType) {
			case AttribType.NUMERIC: {
				const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
				if (attribute) {
					return attribute.array[intersection.index];
				}
				return;
			}
			case AttribType.STRING: {
				const core_geometry = new CoreGeometry(geometry);
				const core_point = core_geometry.points()[intersection.index];
				if (core_point) {
					return core_point.stringAttribValue(attribName);
				}
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}
}
