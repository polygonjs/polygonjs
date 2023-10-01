import {PolyEngine} from '../../../../engine/Poly';
import {
	registerFactoryFunctions,
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
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {SDF_OBJECT_TYPES_SET, SDFObjectType} from './SDFCommon';
import {SDFCoreObject} from './SDFCoreObject';
import {SDFPoint} from './SDFPoint';
import {SDFVertex} from './SDFVertex';
import {SDFPrimitive} from './SDFPrimitive';
import {SDFObject} from './SDFObject';

export function onSDFModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//

	// point methods
	const pointClassFactory: CorePointClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return SDFPoint;
		}
	};
	const pointInstanceFactory: CorePointInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return new SDFPoint(object as SDFObject, index);
		}
	};
	// vertex methods
	const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return SDFVertex;
		}
	};
	const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return new SDFVertex(object as SDFObject, index);
		}
	};
	// primitive methods
	const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return SDFPrimitive;
		}
	};
	const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return new SDFPrimitive(object as SDFObject, index);
		}
	};

	// object methods
	const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return SDFCoreObject;
		}
	};
	const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return new SDFCoreObject(object as SDFObject, index);
		}
	};

	//
	const factoryFunctions: CoreFactoryFunctions = {
		pointClass: pointClassFactory,
		pointInstance: pointInstanceFactory,
		vertexClass: vertexClassFactory,
		vertexInstance: vertexInstanceFactory,
		primitiveClass: primitiveClassFactory,
		primitiveInstance: primitiveInstanceFactory,
		objectClass: objectClassFactory,
		objectInstance: objectInstanceFactory,
	};

	registerFactoryFunctions(factoryFunctions);
	//
	//
	// SPECIALIZED CHILDREN
	//
	//
	// poly.specializedChildren.registerHook('SDF', onAddSpecializedChildren);
}
