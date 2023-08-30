import {Object3D} from 'three';
import {PolyEngine} from '../../../engine/Poly';
import {CoreType} from '../../Type';
import {
	registerFactoryFunctions,
	CoreFactoryFunctions,
	CoreVertexClassFactoryCheckFunction,
	CoreVertexInstanceFactoryCheckFunction,
	CorePrimitiveClassFactoryCheckFunction,
	CorePrimitiveInstanceFactoryCheckFunction,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
} from '../CoreObjectFactory';
import {BaseSopNodeType} from '../../../engine/nodes/sop/_Base';
import {SpecializedChildrenHook} from '../../../engine/poly/PolySpecializedChildrenController';
import {CoreGroup} from '../Group';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {TetTesselationParams, TetOBJTesselationParams} from './TetCommon';
import {TetCoreObject} from './TetCoreObject';
import {isTetObject} from './TetCoreType';
import {TetVertex} from './TetVertex';
import {TetPrimitive} from './TetPrimitive';
import {TetObject} from './TetObject';

const TET_TESSELATION_PARAMS: TetTesselationParams = {
	scale: 1,
	displayOuterMesh: true,
	displayTetMesh: false,
	displayLines: false,
	displaySharedFaces: false,
	displayPoints: false,
	displayCenter: false,
	displaySphere: false,
};
function updateTetTesselationParams(params: TetOBJTesselationParams) {
	TET_TESSELATION_PARAMS.scale = params.TetScale;
	TET_TESSELATION_PARAMS.displayOuterMesh = params.TetDisplayOuterMesh;
	TET_TESSELATION_PARAMS.displayTetMesh = params.TetDisplayTetMesh;
	TET_TESSELATION_PARAMS.displayLines = params.TetDisplayLines;
	TET_TESSELATION_PARAMS.displaySharedFaces = params.TetDisplaySharedFaces;
	TET_TESSELATION_PARAMS.displayCenter = params.TetDisplayCenter;
	TET_TESSELATION_PARAMS.displayPoints = params.TetDisplayPoints;
	TET_TESSELATION_PARAMS.displayCenter = params.TetDisplayCenter;
	TET_TESSELATION_PARAMS.displaySphere = params.TetDisplaySphere;
}
const onAddSpecializedChildren: SpecializedChildrenHook = (
	displayNode: BaseSopNodeType,
	coreGroup: CoreGroup,
	newObjects: Object3D[],
	params: TetOBJTesselationParams
) => {
	let newObjectsAreDifferent = false;
	const newTetObjects = coreGroup.tetObjects();
	if (newTetObjects && newTetObjects.length != 0) {
		updateTetTesselationParams(params);
		for (let tetObject of newTetObjects) {
			const newObject3D = tetObject.toObject3D(TET_TESSELATION_PARAMS);
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
};

export function onTetModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//

	// vertex methods
	const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (isTetObject(object)) {
			return TetVertex;
		}
	};
	const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (isTetObject(object)) {
			return new TetVertex(object as TetObject, index);
		}
	};
	// primitive methods
	const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (isTetObject(object)) {
			return TetPrimitive;
		}
	};
	const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (isTetObject(object)) {
			return new TetPrimitive(object as TetObject, index);
		}
	};

	// object methods
	const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (isTetObject(object)) {
			return TetCoreObject;
		}
	};
	const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (isTetObject(object)) {
			return new TetCoreObject(object as TetObject, index);
		}
	};

	//
	const factoryFunctions: CoreFactoryFunctions = {
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
	poly.specializedChildren.registerHook('TET', onAddSpecializedChildren);
}
