import {Object3D, Color} from 'three';
import {PolyEngine} from '../../../../engine/Poly';
import {SpecializedChildrenHook} from '../../../../engine/poly/PolySpecializedChildrenController';
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
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {QUAD_OBJECT_TYPES_SET, QUADObjectType, QUADTesselationParams, QUADOBJTesselationParams} from './QuadCommon';
import {QuadCoreObject} from './QuadCoreObject';
import {BaseSopNodeType} from '../../../../engine/nodes/sop/_Base';
import {CoreGroup} from '../../Group';
import {isArray} from '../../../Type';
import {QuadPoint} from './QuadPoint';
import {QuadVertex} from './QuadVertex';
import {QuadPrimitive} from './QuadPrimitive';
import {QuadObject} from './QuadObject';
import {ObjectType, registerObjectType} from '../../Constant';

const QUAD_TESSELATION_PARAMS: QUADTesselationParams = {
	triangles: true,
	splitQuads: false,
	wireframe: true,
	unsharedEdges: false,
	wireframeColor: new Color(0, 0, 0),
	center: false,
	innerRadius: false,
	outerRadius: false,
	edgeCenterVectors: false,
	edgeNearestPointVectors: false,
	pointAttributes: '*',
	primitiveAttributes: '*',
};
function updateQUADTesselationParams(params: QUADOBJTesselationParams) {
	QUAD_TESSELATION_PARAMS.triangles = params.QUADTriangles;
	QUAD_TESSELATION_PARAMS.splitQuads = params.QUADSplitQuads;
	QUAD_TESSELATION_PARAMS.wireframe = params.QUADWireframe;
	QUAD_TESSELATION_PARAMS.unsharedEdges = params.QUADUnsharedEdges;
	QUAD_TESSELATION_PARAMS.wireframeColor.copy(params.QUADWireframeColor);
	QUAD_TESSELATION_PARAMS.center = params.QUADCenter;
	QUAD_TESSELATION_PARAMS.innerRadius = params.QUADInnerRadius;
	QUAD_TESSELATION_PARAMS.outerRadius = params.QUADOuterRadius;
	QUAD_TESSELATION_PARAMS.edgeCenterVectors = params.QUADEdgeCenterVectors;
	QUAD_TESSELATION_PARAMS.edgeNearestPointVectors = params.QUADEdgeNearestPointVectors;
	QUAD_TESSELATION_PARAMS.pointAttributes = params.QUADPointAttributes;
	QUAD_TESSELATION_PARAMS.primitiveAttributes = params.QUADPrimitiveAttributes;
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
		for (const quadObject of newQuadObjects) {
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

	// point methods
	const pointClassFactory: CorePointClassFactoryCheckFunction = (object: ObjectContent<CoreObjectType>) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return QuadPoint;
		}
	};
	const pointInstanceFactory: CorePointInstanceFactoryCheckFunction = (
		object: ObjectContent<CoreObjectType>,
		index = 0
	) => {
		if (QUAD_OBJECT_TYPES_SET.has(object.type as QUADObjectType)) {
			return new QuadPoint(object as QuadObject, index);
		}
	};
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
		pointClass: pointClassFactory,
		pointInstance: pointInstanceFactory,
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
	//
	//
	// DATA TYPES
	//
	//
	const type = 'QuadObject';
	registerObjectType({
		type: type as ObjectType,
		checkFunc: (o) => {
			if (QUAD_OBJECT_TYPES_SET.has(o.type as QUADObjectType)) {
				return ObjectType.QUAD;
			}
		},
		ctor: QuadObject,
		humanName: 'QuadObject',
	});
}
