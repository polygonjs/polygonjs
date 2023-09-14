import type {Mesh, LineSegments, Points} from 'three';
import {
	CoreFactoryFunctions,
	CorePointClassFactoryCheckFunction,
	CorePointInstanceFactoryCheckFunction,
	CoreVertexClassFactoryCheckFunction,
	CoreVertexInstanceFactoryCheckFunction,
	CorePrimitiveClassFactoryCheckFunction,
	CorePrimitiveInstanceFactoryCheckFunction,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
} from '../../CoreObjectFactory';
import {CoreObjectType, ObjectContent, isObject3D} from '../../ObjectContent';
import {LineSegmentPrimitive} from './LineSegmentPrimitive';
import {PointPrimitive} from './PointPrimitive';
import {TrianglePrimitive} from './TrianglePrimitive';
import {ThreejsPoint} from './ThreejsPoint';
import {ThreejsVertex} from './ThreejsVertex';
import {ThreejsObject} from './ThreejsObject';

// point methods
const pointClassFactory: CorePointClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		return ThreejsPoint;
	}
};
const pointInstanceFactory: CorePointInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new ThreejsPoint(object, index);
	}
};
// vertex methods
const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		return ThreejsVertex;
	}
};
const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new ThreejsVertex(object, index);
	}
};
// primitive methods
export const primitiveClassFactoryNonAbstract = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		if ((object as Mesh).isMesh) {
			return TrianglePrimitive;
		}
		if ((object as LineSegments).isLineSegments) {
			return LineSegmentPrimitive;
		}
		if ((object as Points).isPoints) {
			return PointPrimitive;
		}
	}
};
const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = primitiveClassFactoryNonAbstract;
export const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		if ((object as Mesh).isMesh) {
			return new TrianglePrimitive(object as Mesh, index);
		}
		if ((object as LineSegments).isLineSegments) {
			return new LineSegmentPrimitive(object as LineSegments, index);
		}
		if ((object as Points).isPoints) {
			return new PointPrimitive(object as Points, index);
		}
	}
};
export const primitiveVerticesCountFactory = (object: ObjectContent<CoreObjectType>): number => {
	if (isObject3D(object)) {
		if ((object as Mesh).isMesh) {
			return 3;
		}
		if ((object as LineSegments).isLineSegments) {
			return 2;
		}
		if ((object as Points).isPoints) {
			return 1;
		}
	}
	return 0;
};
// object methods
const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		return ThreejsObject;
	}
};
const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new ThreejsObject(object, index);
	}
};

//
export const object3DFactory: CoreFactoryFunctions = {
	pointClass: pointClassFactory,
	pointInstance: pointInstanceFactory,
	vertexClass: vertexClassFactory,
	vertexInstance: vertexInstanceFactory,
	primitiveClass: primitiveClassFactory,
	primitiveInstance: primitiveInstanceFactory,
	objectClass: objectClassFactory,
	objectInstance: objectInstanceFactory,
};
