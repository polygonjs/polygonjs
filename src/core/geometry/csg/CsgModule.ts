import {
	registerCoreObjectCheckFunctions,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
	CoreObjectFactoryCheckFunctions,
} from '../CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {CSG_GEOMETRY_TYPES_SET, CsgGeometryType} from './CsgCommon';
import {CsgCoreObject} from './CsgCoreObject';
import {CsgObject} from './CsgObject';

export function onCsgModuleRegister() {
	const classCheckFunction: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return CsgCoreObject;
		}
	};
	const instanceCheckFunction: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return new CsgCoreObject(object as CsgObject<CsgGeometryType>, index);
		}
	};
	const checkFunctions: CoreObjectFactoryCheckFunctions = {
		class: classCheckFunction,
		instance: instanceCheckFunction,
	};

	registerCoreObjectCheckFunctions(checkFunctions);
}
