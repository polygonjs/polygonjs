// import {ModuleName} from '../../../engine/poly/registers/modules/Common';
// import {BaseModule} from '../../../engine/poly/registers/modules/_BaseModule';
import {
	registerCoreObjectCheckFunctions,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
	CoreObjectFactoryCheckFunctions,
} from '../CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {CAD_GEOMETRY_TYPES_SET, CadGeometryType} from './CadCommon';
import {CadCoreObject} from './CadCoreObject';
import {CadObject} from './CadObject';

export function onCadModuleRegister() {
	const classCheckFunction: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return CadCoreObject;
		}
	};
	const instanceCheckFunction: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return new CadCoreObject(object as CadObject<CadGeometryType>, index);
		}
	};
	const checkFunctions: CoreObjectFactoryCheckFunctions = {
		class: classCheckFunction,
		instance: instanceCheckFunction,
	};

	registerCoreObjectCheckFunctions(checkFunctions);
}

// export class CADModule extends BaseModule<ModuleName.CAD> {
// 	moduleName() {
// 		return ModuleName.CAD;
// 	}
// 	// module(){

// 	// }
// 	onRegister() {
// 		const classCheckFunction:CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>)=>{
// 			if(CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)){
// 				return CadCoreObject
// 			}
// 		}
// 		const instanceCheckFunction:CoreObjectInstanceFactoryCheckFunction = (object: ObjectContent<CoreObjectType>,index:number=0)=>{
// 			if(CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)){
// 				return new CadCoreObject(object as CadObject<CadGeometryType>, index)
// 			}
// 		}
// 		const checkFunctions: CoreObjectFactoryCheckFunctions = {
// 			class: classCheckFunction,
// 			instance: instanceCheckFunction,
// 		}

// 		registerCoreObjectCheckFunctions(checkFunctions);
// 	}
// }
