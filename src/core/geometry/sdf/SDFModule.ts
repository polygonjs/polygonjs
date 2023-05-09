import // Object3D,
//  Color
'three';
import {PolyEngine} from '../../../engine/Poly';
import {
	registerCoreObjectCheckFunctions,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
	CoreObjectFactoryCheckFunctions,
} from '../CoreObjectFactory';
// import {BaseSopNodeType} from '../../../engine/nodes/sop/_Base';
// import {SpecializedChildrenHook} from '../../../engine/poly/PolySpecializedChildrenController';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {
	SDF_OBJECT_TYPES_SET,
	SDFObjectType,
	// SDFTesselationParams,
	//  SDFOBJTesselationParams
} from './SDFCommon';
import {SDFCoreObject} from './SDFCoreObject';
import {SDFObject} from './SDFObject';
// import {CoreGroup} from '../Group';
// import {CoreType} from '../../Type';

// const SDF_TESSELATION_PARAMS: SDFTesselationParams = {
// 	facetAngle: 0,
// 	wireframe: false,
// 	meshesColor: new Color(),
// };
// function updateSDFTesselationParams(params: SDFOBJTesselationParams) {
// 	SDF_TESSELATION_PARAMS.facetAngle = params.SDFFacetAngle;
// 	SDF_TESSELATION_PARAMS.wireframe = params.SDFWireframe;
// 	SDF_TESSELATION_PARAMS.meshesColor.copy(params.SDFMeshesColor);
// }
// const onAddSpecializedChildren: SpecializedChildrenHook = (
// 	displayNode: BaseSopNodeType,
// 	coreGroup: CoreGroup,
// 	newObjects: Object3D[],
// 	params: SDFOBJTesselationParams
// ) => {
// 	let newObjectsAreDifferent = false;
// 	const newSDFObjects = coreGroup.SDFObjects();
// 	if (newSDFObjects && newSDFObjects.length != 0) {
// 		updateSDFTesselationParams(params);
// 		for (let sdfObject of newSDFObjects) {
// 			const newObject3D = sdfObject.toObject3D(SDF_TESSELATION_PARAMS);
// 			if (newObject3D) {
// 				newObjectsAreDifferent = true;
// 				if (CoreType.isArray(newObject3D)) {
// 					newObjects.push(...newObject3D);
// 				} else {
// 					newObjects.push(newObject3D);
// 				}
// 			}
// 		}
// 	}
// 	return newObjectsAreDifferent;
// };

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
