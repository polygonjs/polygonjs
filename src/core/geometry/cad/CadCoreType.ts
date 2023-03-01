import {CadCoreObject} from './CadCoreObject';
import {CadObjectType, CAD_OBJECT_TYPES_SET_SHAPE} from './CadCommon';

export class CoreCadType {
	static isPoint2d(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.POINT_2D> {
		return object.type() == CadObjectType.POINT_2D;
	}
	static isGeom2dCurve(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.CURVE_2D> {
		return object.type() == CadObjectType.CURVE_2D;
	}
	static isVertex(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.VERTEX> {
		return object.type() == CadObjectType.VERTEX;
	}
	static isEdge(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.EDGE> {
		return object.type() == CadObjectType.EDGE;
	}
	static isFace(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.FACE> {
		return object.type() == CadObjectType.FACE;
	}
	static isShell(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.SHELL> {
		return object.type() == CadObjectType.SHELL;
	}
	static isSolid(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.SOLID> {
		return object.type() == CadObjectType.SOLID;
	}
	static isShape(
		object: CadCoreObject<CadObjectType>
	): object is
		| CadCoreObject<CadObjectType.VERTEX>
		| CadCoreObject<CadObjectType.EDGE>
		| CadCoreObject<CadObjectType.WIRE>
		| CadCoreObject<CadObjectType.FACE> {
		return CAD_OBJECT_TYPES_SET_SHAPE.has(object.type());
	}
}
