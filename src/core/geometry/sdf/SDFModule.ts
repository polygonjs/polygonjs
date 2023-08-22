import {PolyEngine} from '../../../engine/Poly';
import {
	registerCoreObjectCheckFunctions,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
	CoreObjectFactoryCheckFunctions,
} from '../CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {SDF_OBJECT_TYPES_SET, SDFObjectType} from './SDFCommon';
import {SDFCoreObject} from './SDFCoreObject';
import {SDFObject} from './SDFObject';

export function onSDFModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//
	const classCheckFunction: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return SDFCoreObject;
		}
	};
	const instanceCheckFunction: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (SDF_OBJECT_TYPES_SET.has(object.type as SDFObjectType)) {
			return new SDFCoreObject(object as SDFObject, index);
		}
	};
	const checkFunctions: CoreObjectFactoryCheckFunctions = {
		class: classCheckFunction,
		instance: instanceCheckFunction,
	};

	registerCoreObjectCheckFunctions(checkFunctions);
	//
	//
	// SPECIALIZED CHILDREN
	//
	//
	// poly.specializedChildren.registerHook('SDF', onAddSpecializedChildren);
}
