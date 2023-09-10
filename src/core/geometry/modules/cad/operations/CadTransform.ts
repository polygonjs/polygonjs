import {TopoDS_Shape, Geom2d_Curve, gp_Pnt2d, CadTypeMap, cadGeometryTypeFromShape} from '../CadCommon';
import {CadGeometryType} from '../CadCommon';
import {CadObject} from '../CadObject';
import {Vector2, Vector3} from 'three';
import {cadPnt2dTransform} from '../toObject3D/CadPnt2d';
import {cadGeom2dCurveTransform} from '../toObject3D/CadGeom2dCurve';
import {cadShapeTransform} from '../toObject3D/CadShapeCommon';
import {CadLoaderSync} from '../CadLoaderSync';
import {CoreCadType} from '../CadCoreType';
// import {CadLoaderSync} from '../CadLoaderSync';

const t2 = new Vector2();
const p2 = new Vector2();
export function cadTransform(cadObject: CadObject<CadGeometryType>, t: Vector3, r: Vector3, s: number, p: Vector3) {
	const newGeometry = cadGeometryTransform(cadObject.type, cadObject.cadGeometry(), t, r, s, p);
	if (newGeometry) {
		const oc = CadLoaderSync.oc();
		if (CoreCadType.isGeometryShape(newGeometry)) {
			const newType = cadGeometryTypeFromShape(oc, newGeometry);
			if (newType) {
				cadObject.setGeometry(newGeometry, newType);
			}
		} else {
			// no need to re-add as it is transformed in place
		}
	}
	// switch (cadObject.type) {
	// 	case CadGeometryType.POINT_2D: {
	// 		t2.set(t.x, t.y);
	// 		cadPnt2dTransform(cadObject.cadGeometry() as gp_Pnt2d, t2);
	// 		return cadObject;
	// 	}
	// 	case CadGeometryType.CURVE_2D: {
	// 		t2.set(t.x, t.y);
	// 		p2.set(p.x, p.y);
	// 		cadGeom2dCurveTransform(cadObject.cadGeometry() as Geom2d_Curve, t2, r.z, s, p2);
	// 		return cadObject;
	// 	}

	// 	case CadGeometryType.VERTEX:
	// 	case CadGeometryType.EDGE:
	// 	case CadGeometryType.WIRE:
	// 	case CadGeometryType.FACE:
	// 	case CadGeometryType.SHELL:
	// 	case CadGeometryType.SOLID:
	// 	case CadGeometryType.COMPSOLID:
	// 	case CadGeometryType.COMPOUND: {
	// 		// make sure to re-assign the object,
	// 		// since it is not modified in place
	// 		const oc = CadLoaderSync.oc();
	// 		if (!oc) {
	// 			return;
	// 		}
	// 		const newShape = cadShapeTransform(cadObject.cadGeometry() as TopoDS_Shape, t, r, s, p);
	// 		if (!newShape) {
	// 			return;
	// 		}
	// 		const type = cadGeometryTypeFromShape(oc, newShape);
	// 		if (type) {
	// 			return CadObject.fromGeometry(newShape, type);
	// 		} else {
	// 			console.log('no type', newShape);
	// 		}
	// 		return;
	// 	}
	// }
}

export function cadGeometryTransform<T extends CadGeometryType>(
	type: T,
	geometry: CadTypeMap[T],
	t: Vector3,
	r: Vector3,
	s: number,
	p: Vector3
) {
	switch (type) {
		case CadGeometryType.POINT_2D: {
			t2.set(t.x, t.y);
			cadPnt2dTransform(geometry as gp_Pnt2d, t2);
			return geometry;
		}
		case CadGeometryType.CURVE_2D: {
			t2.set(t.x, t.y);
			p2.set(p.x, p.y);
			cadGeom2dCurveTransform(geometry as Geom2d_Curve, t2, r.z, s, p2);
			return geometry;
		}

		case CadGeometryType.VERTEX:
		case CadGeometryType.EDGE:
		case CadGeometryType.WIRE:
		case CadGeometryType.FACE:
		case CadGeometryType.SHELL:
		case CadGeometryType.SOLID:
		case CadGeometryType.COMPSOLID:
		case CadGeometryType.COMPOUND: {
			const newShape = cadShapeTransform(geometry as TopoDS_Shape, t, r, s, p);
			return newShape;
		}
	}
}
