// import {ModuleName} from '../../../engine/poly/registers/modules/Common';
// import {BaseModule} from '../../../engine/poly/registers/modules/_BaseModule';
import {Object3D, Color} from 'three';
import {BaseSopNodeType} from '../../../engine/nodes/sop/_Base';
import {PolyEngine} from '../../../engine/Poly';
import {SpecializedChildrenHook} from '../../../engine/poly/PolySpecializedChildrenController';
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
import {CoreGroup} from '../Group';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {CAD_GEOMETRY_TYPES_SET, CadGeometryType, CADTesselationParams, CADOBJTesselationParams} from './CadCommon';
import {CadCoreObject} from './CadCoreObject';
import {CadVertex} from './CadVertex';
import {CadPrimitive} from './CadPrimitive';
import {CadObject} from './CadObject';

const CAD_TESSELATION_PARAMS: CADTesselationParams = {
	linearTolerance: 0,
	angularTolerance: 0,
	curveAbscissa: 0,
	curveTolerance: 0,
	wireframe: false,
	displayMeshes: false,
	displayEdges: false,
	meshesColor: new Color(),
	edgesColor: new Color(),
};

function updateCADTesselationParams(params: CADOBJTesselationParams) {
	CAD_TESSELATION_PARAMS.linearTolerance = params.CADLinearTolerance;
	CAD_TESSELATION_PARAMS.angularTolerance = params.CADAngularTolerance;
	CAD_TESSELATION_PARAMS.curveAbscissa = params.CADCurveAbscissa;
	CAD_TESSELATION_PARAMS.curveTolerance = params.CADCurveTolerance;
	//
	CAD_TESSELATION_PARAMS.wireframe = params.CADWireframe;
	CAD_TESSELATION_PARAMS.displayMeshes = params.CADDisplayMeshes;
	CAD_TESSELATION_PARAMS.displayEdges = params.CADDisplayEdges;
	CAD_TESSELATION_PARAMS.meshesColor.copy(params.CADMeshesColor);
	CAD_TESSELATION_PARAMS.edgesColor.copy(params.CADEdgesColor);
}
const onAddSpecializedChildren: SpecializedChildrenHook = (
	displayNode: BaseSopNodeType,
	coreGroup: CoreGroup,
	newObjects: Object3D[],
	params: CADOBJTesselationParams
) => {
	let newObjectsAreDifferent = false;
	const newCadObjects = coreGroup.cadObjects();
	if (newCadObjects && newCadObjects.length != 0) {
		updateCADTesselationParams(params);
		for (let cadObject of newCadObjects) {
			const newObject3D = cadObject.toObject3D(CAD_TESSELATION_PARAMS, displayNode);
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

export function onCadModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//

	// vertex methods
	const vertexClassFactory: CoreVertexClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return CadVertex;
		}
	};
	const vertexInstanceFactory: CoreVertexInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return new CadVertex(object as CadObject<CadGeometryType>, index);
		}
	};

	// primitive methods
	const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return CadPrimitive;
		}
	};
	const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return new CadPrimitive(object as CadObject<CadGeometryType>, index);
		}
	};

	// object methods
	const objectClassFactory: CoreObjectClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return CadCoreObject;
		}
	};
	const objectInstanceFactory: CoreObjectInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return new CadCoreObject(object as CadObject<CadGeometryType>, index);
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
	poly.specializedChildren.registerHook('CAD', onAddSpecializedChildren);
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
