// import type {OpenCascadeInstance} from 'opencascade.js';
import {
	// CadGeometry,
	// CadGeometry,
	// Geom2d_Curve,
	// TopoDS_Edge,
	// TopoDS_Wire,
	// TopoDS_Vertex,
	// TopoDS_Shape,
	// gp_Pnt2d,
	CadGeometryType,
	CadTypeMap,
	// CadTypeMap,
	// TesselationParams,
	// cadGeometryTypeFromShape,
	// cadDowncast,
} from './CadCommon';
import {BaseCoreObject} from '../_BaseObject';
// import {CadLoader} from './CadLoader';
// import {CoreCadType} from './CadCoreType';
// import {cadPnt2dToObject3D, cadPnt2dClone} from './toObject3D/CadPnt2d';
// import {cadVertexToObject3D, cadVertexClone} from './toObject3D/CadVertex';
// import {cadGeom2dCurveToObject3D, cadGeom2dCurveClone} from './toObject3D/CadGeom2dCurve';
// import {cadEdgeToObject3D, cadEdgeClone} from './toObject3D/CadEdge';
// import {cadWireToObject3D, cadWireClone} from './toObject3D/CadWire';
// import {cadShapeToObject3D} from './toObject3D/CadShape';
// import {cadShapeClone} from './toObject3D/CadShapeCommon';
// import {Object3D} from 'three';
import {CadObject} from './CadObject';
import {CoreObjectType} from '../ObjectContent';
import {Box3, Matrix4, Sphere, Vector3} from 'three';
import {TransformTargetType} from '../../Transform';
import {ObjectTransformSpace} from '../../TransformSpace';
// import { CadLoaderSync } from './CadLoaderSync';
// import {Object3D, Vector3} from 'three'
// import {withCadException} from './CadExceptionHandler';
// const BBOX_EMPTY = new Box3();
const SPHERE_EMPTY = new Sphere();
const ORIGIN = new Vector3(0, 0, 0);
export class CadCoreObject<T extends CadGeometryType> extends BaseCoreObject<CoreObjectType.CAD> {
	constructor(protected override _object: CadObject<T>, index: number) {
		super(_object, index);

		// if ((_object as TopoDS_Shape).ShapeType) {
		// 	const type = cadObjectTypeFromShape(oc, _object as any);
		// 	if (type != null && type != _type) {
		// 		console.error('got type', type, 'instead of expected', _type);
		// 	}
		// }
	}
	type() {
		return this._object.type;
	}

	static fromGeometry<T extends CadGeometryType>(geometry: CadTypeMap[T], type: T) {
		const cadObject = new CadObject(geometry, type);
		return new CadCoreObject(cadObject, 0);
	}
	override object() {
		return this._object;
	}
	// static override position = cadObjectPosition as any;
	static override position(object: CadObject<CadGeometryType>, target: Vector3) {
		console.warn('cad position not implemented');
		target.copy(ORIGIN);
		// return target.copy(object.position);
	}
	override boundingBox(target: Box3) {
		this._object.boundingBox(target);
	}
	override boundingSphere(target: Sphere) {
		console.warn('cad boundingSphere not implemented');
		return SPHERE_EMPTY;
	}

	static override applyMatrix<T extends CadGeometryType>(
		object: CadObject<T>,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace
	) {
		object.applyMatrix4(matrix);
	}
	// static override position(object: Object3D):Vector3 {
	// 	// TODO: optimize
	// 	return object.position;
	// }
	// override position(): Vector3 {
	// 	return new Vector3()
	// }
	// dispose() {}

	// object() {
	// 	return this._object;
	// }
	// type() {
	// 	return this._type!;
	// }

	// clone(): CadCoreObject<T> {
	// 	return new CadCoreObject(this._object.clone(),this._index)
	// 	// return CadCoreObject.clone(this);
	// }

	// static override clone<T extends CadGeometryType>(srcObject: CadCoreObject<T>): CadCoreObject<T> {
	// 	// const clonedObject = cloneCadObject<T>(srcObject.type(), srcObject.object());
	// 	// if (clonedObject) {
	// 		return new CadCoreObject(clonedObject, srcObject.type());
	// 	// } else {
	// 	// }

	// 	// console.warn('not cloning');
	// 	// return this as any as CadCoreObject<T>;
	// }
	// toObject3D(oc: OpenCascadeInstance, tesselationParams: TesselationParams): Object3D | Object3D[] | undefined {
	// 	// return withCadException(oc, () => {
	// 	return CadCoreObject.toObject3D(oc, this._object, this.type(), tesselationParams);
	// 	// }) as any as Object3D;
	// }

	// static toObject3D(
	// 	oc: OpenCascadeInstance,
	// 	object: CadObject,
	// 	type: CadObjectType,
	// 	tesselationParams: TesselationParams
	// ) {
	// 	switch (type) {
	// 		case CadObjectType.POINT_2D: {
	// 			return cadPnt2dToObject3D(oc, object as gp_Pnt2d);
	// 		}
	// 		case CadObjectType.CURVE_2D: {
	// 			return cadGeom2dCurveToObject3D(oc, object as Geom2d_Curve, tesselationParams);
	// 		}
	// 		// case CadObjectType.CURVE_3D: {
	// 		// 	return cadGeomCurveToObject3D(oc, object as Geom_Curve, tesselationParams);
	// 		// }
	// 		case CadObjectType.VERTEX: {
	// 			return cadVertexToObject3D(oc, object as TopoDS_Vertex);
	// 		}
	// 		case CadObjectType.EDGE: {
	// 			return cadEdgeToObject3D(oc, object as TopoDS_Edge, tesselationParams);
	// 		}
	// 		case CadObjectType.WIRE: {
	// 			return cadWireToObject3D(oc, object as TopoDS_Wire, tesselationParams);
	// 		}
	// 		case CadObjectType.FACE:
	// 		case CadObjectType.SHELL:
	// 		case CadObjectType.SOLID:
	// 		case CadObjectType.COMPSOLID:
	// 		case CadObjectType.COMPOUND: {
	// 			return cadShapeToObject3D(oc, object as TopoDS_Shape, tesselationParams);
	// 		}
	// 	}
	// }
}
