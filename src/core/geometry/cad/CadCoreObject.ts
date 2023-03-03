import type {OpenCascadeInstance} from 'opencascade.js';
import {
	CadObject,
	Geom2d_Curve,
	TopoDS_Edge,
	TopoDS_Wire,
	TopoDS_Vertex,
	TopoDS_Shape,
	gp_Pnt2d,
	CadObjectType,
	CadTypeMap,
	TesselationParams,
	cadObjectTypeFromShape,
	cadDowncast,
} from './CadCommon';
import {CadLoader} from './CadLoader';
import {CoreCadType} from './CadCoreType';
import {cadPnt2dToObject3D, cadPnt2dClone} from './toObject3D/CadPnt2d';
import {cadVertexToObject3D, cadVertexClone} from './toObject3D/CadVertex';
import {cadGeom2dCurveToObject3D, cadGeom2dCurveClone} from './toObject3D/CadGeom2dCurve';
import {cadEdgeToObject3D, cadEdgeClone} from './toObject3D/CadEdge';
import {cadWireToObject3D, cadWireClone} from './toObject3D/CadWire';
import {cadShapeToObject3D} from './toObject3D/CadShape';
import {cadShapeClone} from './toObject3D/CadShapeCommon';
import {Object3D} from 'three';
// import {withCadException} from './CadExceptionHandler';

function cloneCadObject<T extends CadObjectType>(
	type: CadObjectType,
	srcObject: CadTypeMap[T]
): CadTypeMap[T] | undefined {
	switch (type) {
		case CadObjectType.POINT_2D: {
			return cadPnt2dClone(srcObject as gp_Pnt2d) as CadTypeMap[T];
		}
		case CadObjectType.CURVE_2D: {
			return cadGeom2dCurveClone(srcObject as Geom2d_Curve) as CadTypeMap[T];
		}
		// case CadObjectType.CURVE_3D: {
		// 	return cadGeomCurveClone(srcObject as Geom_Curve) as CadTypeMap[T];
		// }
		case CadObjectType.VERTEX: {
			return cadVertexClone(srcObject as TopoDS_Vertex) as CadTypeMap[T];
		}
		case CadObjectType.EDGE: {
			return cadEdgeClone(srcObject as TopoDS_Edge) as CadTypeMap[T];
		}
		case CadObjectType.WIRE: {
			return cadWireClone(srcObject as TopoDS_Wire) as CadTypeMap[T];
		}
		case CadObjectType.FACE:
		case CadObjectType.SHELL:
		case CadObjectType.SOLID:
		case CadObjectType.COMPSOLID:
		case CadObjectType.COMPOUND: {
			return cadShapeClone(srcObject as TopoDS_Shape) as CadTypeMap[T];
		}
	}
}

export class CadCoreObject<T extends CadObjectType> {
	constructor(private _object: CadTypeMap[T], private _type?: T) {
		const oc = CadLoader.oc();

		if (CoreCadType.isObjectShape(this._object)) {
			this._object = cadDowncast(oc, this._object) as CadTypeMap[T];
			const type = cadObjectTypeFromShape(oc, _object as any) as T;
			if (type) {
				this._type = type;
			} else {
				console.error('no type for object', this._object);
			}
		} else {
			if (this._type == null) {
				console.error('type is required for object', this._object);
			}
		}
		// if ((_object as TopoDS_Shape).ShapeType) {
		// 	const type = cadObjectTypeFromShape(oc, _object as any);
		// 	if (type != null && type != _type) {
		// 		console.error('got type', type, 'instead of expected', _type);
		// 	}
		// }
	}
	dispose() {}

	object() {
		return this._object;
	}
	type() {
		return this._type!;
	}

	clone(): CadCoreObject<T> {
		return CadCoreObject.clone(this);
	}

	static clone<T extends CadObjectType>(srcObject: CadCoreObject<T>): CadCoreObject<T> {
		const clonedObject = cloneCadObject<T>(srcObject.type(), srcObject.object());
		if (clonedObject) {
			return new CadCoreObject(clonedObject, srcObject.type());
		} else {
		}

		console.warn('not cloning');
		return this as any as CadCoreObject<T>;
	}
	toObject3D(oc: OpenCascadeInstance, tesselationParams: TesselationParams): Object3D | Object3D[] | undefined {
		// return withCadException(oc, () => {
		return CadCoreObject.toObject3D(oc, this._object, this.type(), tesselationParams);
		// }) as any as Object3D;
	}

	static toObject3D(
		oc: OpenCascadeInstance,
		object: CadObject,
		type: CadObjectType,
		tesselationParams: TesselationParams
	) {
		switch (type) {
			case CadObjectType.POINT_2D: {
				return cadPnt2dToObject3D(oc, object as gp_Pnt2d);
			}
			case CadObjectType.CURVE_2D: {
				return cadGeom2dCurveToObject3D(oc, object as Geom2d_Curve, tesselationParams);
			}
			// case CadObjectType.CURVE_3D: {
			// 	return cadGeomCurveToObject3D(oc, object as Geom_Curve, tesselationParams);
			// }
			case CadObjectType.VERTEX: {
				return cadVertexToObject3D(oc, object as TopoDS_Vertex);
			}
			case CadObjectType.EDGE: {
				return cadEdgeToObject3D(oc, object as TopoDS_Edge, tesselationParams);
			}
			case CadObjectType.WIRE: {
				return cadWireToObject3D(oc, object as TopoDS_Wire, tesselationParams);
			}
			case CadObjectType.FACE:
			case CadObjectType.SHELL:
			case CadObjectType.SOLID:
			case CadObjectType.COMPSOLID:
			case CadObjectType.COMPOUND: {
				return cadShapeToObject3D(oc, object as TopoDS_Shape, tesselationParams);
			}
		}
	}
}
