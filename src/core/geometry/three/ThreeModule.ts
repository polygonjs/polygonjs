import type {Mesh, LineSegments, Points} from 'three';
import {
	CoreFactoryFunctions,
	CoreVertexClassFactoryCheckFunction,
	CoreVertexInstanceFactoryCheckFunction,
	CorePrimitiveClassFactoryCheckFunction,
	CorePrimitiveInstanceFactoryCheckFunction,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
} from '../CoreObjectFactory';
import {CoreObjectType, ObjectContent, isObject3D} from '../ObjectContent';
import {CoreObject} from '../Object';
import {LineSegmentPrimitive} from './LineSegmentPrimitive';
import {PointPrimitive} from './PointPrimitive';
import {TrianglePrimitive} from './TrianglePrimitive';
import {CoreThreejsVertex} from './CoreThreejsVertex';

// primitive methods
const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		return CoreThreejsVertex;
	}
};
const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new CoreThreejsVertex(object, index);
	}
};
// primitive methods
const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
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
const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
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
// object methods
const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		return CoreObject;
	}
};
const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new CoreObject(object, index);
	}
};

//
export const object3DFactory: CoreFactoryFunctions = {
	vertexClass: vertexClassFactory,
	vertexInstance: vertexInstanceFactory,
	primitiveClass: primitiveClassFactory,
	primitiveInstance: primitiveInstanceFactory,
	objectClass: objectClassFactory,
	objectInstance: objectInstanceFactory,
};
