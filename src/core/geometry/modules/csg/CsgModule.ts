import {Object3D, Color} from 'three';
import {PolyEngine} from '../../../../engine/Poly';
import {CoreType} from '../../../Type';
import {
	registerFactoryFunctions,
	CoreFactoryFunctions,
	CoreVertexClassFactoryCheckFunction,
	CoreVertexInstanceFactoryCheckFunction,
	CorePrimitiveClassFactoryCheckFunction,
	CorePrimitiveInstanceFactoryCheckFunction,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
} from '../../CoreObjectFactory';
import {BaseSopNodeType} from '../../../../engine/nodes/sop/_Base';
import {SpecializedChildrenHook} from '../../../../engine/poly/PolySpecializedChildrenController';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CSG_GEOMETRY_TYPES_SET, CsgGeometryType, CSGTesselationParams, CSGOBJTesselationParams} from './CsgCommon';
import {CsgCoreObject} from './CsgCoreObject';
import {CsgVertex} from './CsgVertex';
import {CsgPrimitive} from './CsgPrimitive';
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
const onAddSpecializedChildren: SpecializedChildrenHook = (
	displayNode: BaseSopNodeType,
	coreGroup: CoreGroup,
	newObjects: Object3D[],
	params: CSGOBJTesselationParams
) => {
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
};

export function onCsgModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//
	// vertex methods
	const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return CsgVertex;
		}
	};
	const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return new CsgVertex(object as CsgObject<CsgGeometryType>, index);
		}
	};
	// primitive methods
	const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return CsgPrimitive;
		}
	};
	const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return new CsgPrimitive(object as CsgObject<CsgGeometryType>, index);
		}
	};

	// object methods
	const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return CsgCoreObject;
		}
	};
	const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CSG_GEOMETRY_TYPES_SET.has(object.type as CsgGeometryType)) {
			return new CsgCoreObject(object as CsgObject<CsgGeometryType>, index);
		}
	};

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
	poly.specializedChildren.registerHook('CSG', onAddSpecializedChildren);
}
