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
import {CoreThreejsPoint} from './CoreThreejsPoint';
import {CoreThreejsVertex} from './CoreThreejsVertex';
import {CoreObject} from './CoreObject';

// point methods
const pointClassFactory: CorePointClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
	if (isObject3D(object)) {
		return CoreThreejsPoint;
	}
};
const pointInstanceFactory: CorePointInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new CoreThreejsPoint(object, index);
	}
};
// vertex methods
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
	pointClass: pointClassFactory,
	pointInstance: pointInstanceFactory,
	vertexClass: vertexClassFactory,
	vertexInstance: vertexInstanceFactory,
	primitiveClass: primitiveClassFactory,
	primitiveInstance: primitiveInstanceFactory,
	objectClass: objectClassFactory,
	objectInstance: objectInstanceFactory,
};
