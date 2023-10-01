// import {TypeAssert} from '../../../engine/poly/Assert';
import {ObjectType} from '../../../Constant';
import {CoreGeometryBuilderLineSegments} from './LineSegments';
import {CoreGeometryBuilderMesh} from './Mesh';
import {CoreGeometryBuilderPoints} from './Points';

export function geometryBuilder(objectType: ObjectType) {
	switch (objectType) {
		case ObjectType.MESH:
			return new CoreGeometryBuilderMesh();
		case ObjectType.POINTS:
			return new CoreGeometryBuilderPoints();
		case ObjectType.LINE_SEGMENTS:
			return new CoreGeometryBuilderLineSegments();
		case ObjectType.OBJECT3D:
			return null;
		case ObjectType.GROUP:
			return null;
		// case ObjectType.LOD:
		// 	return null;
	}
	return null;
	// TypeAssert.unreachable(objectType);
}
