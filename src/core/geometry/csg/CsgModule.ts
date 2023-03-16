import {Object3D, Color} from 'three';
import {PolyEngine} from '../../../engine/Poly';
import {CoreType} from '../../Type';
import {
	registerCoreObjectCheckFunctions,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
	CoreObjectFactoryCheckFunctions,
} from '../CoreObjectFactory';
import {CoreGroup} from '../Group';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {CSG_GEOMETRY_TYPES_SET, CsgGeometryType, CSGTesselationParams, CSGOBJTesselationParams} from './CsgCommon';
import {CsgCoreObject} from './CsgCoreObject';
import {CsgObject} from './CsgObject';

const CSG_TESSELATION_PARAMS: CSGTesselationParams = {
	facetAngle: 0,
	wireframe: false,
	meshesColor: new Color(),
	linesColor: new Color(),
};
function updateCSGTesselationParams(params: CSGOBJTesselationParams) {
	CSG_TESSELATION_PARAMS.facetAngle = params.CSGFacetAngle;
	CSG_TESSELATION_PARAMS.wireframe = params.CSGWireframe;
	CSG_TESSELATION_PARAMS.meshesColor.copy(params.CSGMeshesColor);
	CSG_TESSELATION_PARAMS.linesColor.copy(params.CSGLinesColor);
}
function onAddSpecializedChildren(coreGroup: CoreGroup, newObjects: Object3D[], params: CSGOBJTesselationParams) {
	let newObjectsAreDifferent = false;
	const newCsgObjects = coreGroup.csgObjects();
	if (newCsgObjects && newCsgObjects.length != 0) {
		updateCSGTesselationParams(params);
		for (let csgObject of newCsgObjects) {
			const newObject3D = csgObject.toObject3D(CSG_TESSELATION_PARAMS);
			if (newObject3D) {
				newObjectsAreDifferent = true;
				if (CoreType.isArray(newObject3D)) {
					newObjects.push(...newObject3D);
				} else {
					newObjects.push(newObject3D);
				}
			}
		}
	}
	return newObjectsAreDifferent;
}

export function onCsgModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//
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

	//
	//
	// SPECIALIZED CHILDREN
	//
	//
	poly.specializedChildren.registerHook('CSG', onAddSpecializedChildren);
}
