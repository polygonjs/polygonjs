import {Object3D} from 'three';
import {PolyEngine} from '../../../engine/Poly';
import {SpecializedChildrenHook} from '../../../engine/poly/PolySpecializedChildrenController';
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
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {QUAD_OBJECT_TYPES_SET, QUADObjectType, QUADTesselationParams, QUADOBJTesselationParams} from './QuadCommon';
import {QuadCoreObject} from './QuadCoreObject';
import {BaseSopNodeType} from '../../../engine/nodes/sop/_Base';
import {CoreGroup} from '../Group';
import {isArray} from '../../Type';
import {QuadVertex} from './QuadVertex';
import {QuadPrimitive} from './QuadPrimitive';
import {QuadObject} from './QuadObject';

const QUAD_TESSELATION_PARAMS: QUADTesselationParams = {
	triangles: true,
	wireframe: false,
};
function updateQUADTesselationParams(params: QUADOBJTesselationParams) {
	QUAD_TESSELATION_PARAMS.triangles = params.QUADTriangles;
	QUAD_TESSELATION_PARAMS.wireframe = params.QUADWireframe;
}
const onAddSpecializedChildren: SpecializedChildrenHook = (
	displayNode: BaseSopNodeType,
	coreGroup: CoreGroup,
	newObjects: Object3D[],
	params: QUADOBJTesselationParams
) => {
	let newObjectsAreDifferent = false;
	const newQuadObjects = coreGroup.quadObjects();
	if (newQuadObjects && newQuadObjects.length != 0) {
		updateQUADTesselationParams(params);
		for (let quadObject of newQuadObjects) {
			const newObject3D = quadObject.toObject3D(QUAD_TESSELATION_PARAMS);
			if (newObject3D) {
				newObjectsAreDifferent = true;
				if (isArray(newObject3D)) {
					newObjects.push(...newObject3D);
				} else {
					newObjects.push(newObject3D);
				}
			}
		}
	}
	return newObjectsAreDifferent;
};

export function onQuadModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//
	// vertex methods
	const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return QuadVertex;
		}
	};
	const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index = 0
	) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return new QuadVertex(object as QuadObject, index);
		}
	};
	// primitive methods
	const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return QuadPrimitive;
		}
	};
	const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index = 0
	) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return new QuadPrimitive(object as QuadObject, index);
		}
	};

	// object methods
	const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return QuadCoreObject;
		}
	};
	const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return new QuadCoreObject(object as QuadObject, index);
		}
	};

	const factoryFunction: CoreFactoryFunctions = {
		vertexClass: vertexClassFactory,
		vertexInstance: vertexInstanceFactory,
		primitiveClass: primitiveClassFactory,
		primitiveInstance: primitiveInstanceFactory,
		objectClass: objectClassFactory,
		objectInstance: objectInstanceFactory,
	};

	registerFactoryFunctions(factoryFunction);
	//
	//
	// SPECIALIZED CHILDREN
	//
	//
	poly.specializedChildren.registerHook('QUAD', onAddSpecializedChildren);
}
