// import {ModuleName} from '../../../engine/poly/registers/modules/Common';
// import {BaseModule} from '../../../engine/poly/registers/modules/_BaseModule';
import {Object3D, Color} from 'three';
import {BaseSopNodeType} from '../../../../engine/nodes/sop/_Base';
import {PolyEngine} from '../../../../engine/Poly';
import {SpecializedChildrenHook} from '../../../../engine/poly/PolySpecializedChildrenController';
import {isArray} from '../../../Type';
import {
	registerFactoryFunctions,
	CoreFactoryFunctions,
	CorePointClassFactoryCheckFunction,
	CorePointInstanceFactoryCheckFunction,
	CoreVertexClassFactoryCheckFunction,
	CoreVertexInstanceFactoryCheckFunction,
	CorePrimitiveClassFactoryCheckFunction,
	CorePrimitiveInstanceFactoryCheckFunction,
	CoreObjectClassFactoryCheckFunction,
	CoreObjectInstanceFactoryCheckFunction,
} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CAD_GEOMETRY_TYPES_SET, CadGeometryType, CADTesselationParams, CADOBJTesselationParams} from './CadCommon';
import {CadCoreObject} from './CadCoreObject';
import {CadPoint} from './CadPoint';
import {CadVertex} from './CadVertex';
import {CadObject} from './CadObject';
import {TypeAssert} from '../../../../engine/poly/Assert';
import {CadPrimitiveCompound} from './CadPrimitiveCompound';
import {CadPrimitiveCompSolid} from './CadPrimitiveCompSolid';
import {CadPrimitiveEdge} from './CadPrimitiveEdge';
import {CadPrimitiveWire} from './CadPrimitiveWire';
import {CadPrimitiveFace} from './CadPrimitiveFace';
import {CadPrimitiveShell} from './CadPrimitiveShell';
import {CadPrimitiveSolid} from './CadPrimitiveSolid';

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
		for (const cadObject of newCadObjects) {
			const newObject3D = cadObject.toObject3D(CAD_TESSELATION_PARAMS, displayNode);
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

// primitive methods
export const primitiveClassFactoryNonAbstract = (object: ObjectContent<CoreObjectType>) => {
	if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
		const type = object.type as CadGeometryType;
		switch (type) {
			case CadGeometryType.POINT_2D: {
				return;
			}
			case CadGeometryType.CURVE_2D: {
				return;
			}
			case CadGeometryType.VERTEX: {
				return;
			}
			case CadGeometryType.EDGE: {
				return CadPrimitiveEdge;
			}
			case CadGeometryType.WIRE: {
				return CadPrimitiveWire;
			}
			case CadGeometryType.FACE: {
				return CadPrimitiveFace;
			}
			case CadGeometryType.SHELL: {
				return CadPrimitiveShell;
			}
			case CadGeometryType.SOLID: {
				return CadPrimitiveSolid;
			}
			case CadGeometryType.COMPSOLID: {
				return CadPrimitiveCompSolid;
			}
			case CadGeometryType.COMPOUND: {
				return CadPrimitiveCompound;
			}
		}
		TypeAssert.unreachable(type);
	}
};

export function onCadModuleRegister(poly: PolyEngine) {
	//
	//
	// CORE OBJECT CHECKS
	//
	//

	// point methods
	const pointClassFactory: CorePointClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return CadPoint;
		}
	};
	const pointInstanceFactory: CorePointInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			return new CadPoint(object as CadObject<CadGeometryType>, index);
		}
	};
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
	const primitiveClassFactory: CorePrimitiveClassFactoryCheckFunction = primitiveClassFactoryNonAbstract;
	const primitiveInstanceFactory: CorePrimitiveInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index: number = 0
	) => {
		if (CAD_GEOMETRY_TYPES_SET.has(object.type as CadGeometryType)) {
			const type = object.type as CadGeometryType;
			switch (type) {
				case CadGeometryType.POINT_2D: {
					return;
				}
				case CadGeometryType.CURVE_2D: {
					return;
				}
				case CadGeometryType.VERTEX: {
					return;
				}
				case CadGeometryType.EDGE: {
					return new CadPrimitiveEdge(object as CadObject<CadGeometryType.EDGE>, index);
				}
				case CadGeometryType.WIRE: {
					return new CadPrimitiveWire(object as CadObject<CadGeometryType.WIRE>, index);
				}
				case CadGeometryType.FACE: {
					return new CadPrimitiveFace(object as CadObject<CadGeometryType.FACE>, index);
				}
				case CadGeometryType.SHELL: {
					return new CadPrimitiveShell(object as CadObject<CadGeometryType.SHELL>, index);
				}
				case CadGeometryType.SOLID: {
					return new CadPrimitiveSolid(object as CadObject<CadGeometryType.SOLID>, index);
				}
				case CadGeometryType.COMPSOLID: {
					return new CadPrimitiveCompSolid(object as CadObject<CadGeometryType.COMPSOLID>, index);
				}
				case CadGeometryType.COMPOUND: {
					return new CadPrimitiveCompound(object as CadObject<CadGeometryType.COMPOUND>, index);
				}
			}
			TypeAssert.unreachable(type);
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
		pointClass: pointClassFactory,
		pointInstance: pointInstanceFactory,
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
