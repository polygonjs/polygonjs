import {CadGeometryType} from './cad/CadCommon';
import {CadCoreObject} from './cad/CadCoreObject';
import {CadObject} from './cad/CadObject';
import {BaseCoreObject} from './_BaseObject';
import {CoreObject} from './Object';
import {CoreObjectType, isObject3D, ObjectContent} from './ObjectContent';

export function coreObjectFactory(object: ObjectContent<CoreObjectType>): typeof BaseCoreObject<CoreObjectType> {
	// TODO: make this driven by the modules register
	if (isObject3D(object)) {
		return CoreObject;
	} else {
		return CadCoreObject;
	}
}

export function coreObjectInstanceFactory(
	object: ObjectContent<CoreObjectType>,
	index = 0
): BaseCoreObject<CoreObjectType> {
	// TODO: make this driven by the modules register
	if (isObject3D(object)) {
		return new CoreObject(object, index);
	} else {
		return new CadCoreObject(object as CadObject<CadGeometryType>, index);
	}
}
