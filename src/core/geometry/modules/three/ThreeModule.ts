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
import {ThreejsPoint} from './ThreejsPoint';
import {ThreejsVertex} from './ThreejsVertex';
import {ThreejsCoreObject} from './ThreejsCoreObject';
import {ThreejsPrimitiveTriangle} from './ThreejsPrimitiveTriangle';
import {ThreejsPrimitiveLineSegment} from './ThreejsPrimitiveLineSegment';
import {ThreejsPrimitivePoint} from './ThreejsPrimitivePoint';

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
			return ThreejsPrimitiveTriangle;
		}
		if ((object as LineSegments).isLineSegments) {
			return ThreejsPrimitiveLineSegment;
		}
		if ((object as Points).isPoints) {
			return ThreejsPrimitivePoint;
		}
		return ThreejsPrimitiveTriangle;
	}
};
const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = primitiveClassFactoryNonAbstract;
export const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		if ((object as Mesh).isMesh) {
			return new ThreejsPrimitiveTriangle(object as Mesh, index);
		}
		if ((object as LineSegments).isLineSegments) {
			return new ThreejsPrimitiveLineSegment(object as LineSegments, index);
		}
		if ((object as Points).isPoints) {
			return new ThreejsPrimitivePoint(object as Points, index);
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
		return ThreejsCoreObject;
	}
};
const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index = 0
) => {
	if (isObject3D(object)) {
		return new ThreejsCoreObject(object, index);
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
