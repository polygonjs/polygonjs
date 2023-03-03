import {CadCoreObject} from './CadCoreObject';
import {CadObjectType, CadObjectTypeShape, CAD_OBJECT_TYPES_SET_SHAPE, CadTypeMap, CadShape} from './CadCommon';
import {CoreType} from '../../Type';
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
	static isWire(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.WIRE> {
		return object.type() == CadObjectType.WIRE;
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
	static isCompsolid(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.COMPSOLID> {
		return object.type() == CadObjectType.COMPSOLID;
	}
	static isCompound(object: CadCoreObject<CadObjectType>): object is CadCoreObject<CadObjectType.COMPOUND> {
		return object.type() == CadObjectType.COMPOUND;
	}
	static isShape(
		object: CadCoreObject<CadObjectType>
	): object is
		| CadCoreObject<CadObjectType.VERTEX>
		| CadCoreObject<CadObjectType.EDGE>
		| CadCoreObject<CadObjectType.WIRE>
		| CadCoreObject<CadObjectType.FACE>
		| CadCoreObject<CadObjectType.SHELL>
		| CadCoreObject<CadObjectType.SOLID>
		| CadCoreObject<CadObjectType.COMPSOLID>
		| CadCoreObject<CadObjectType.COMPOUND> {
		return CAD_OBJECT_TYPES_SET_SHAPE.has(object.type() as CadObjectTypeShape);
	}
	static isObjectShape<T extends CadObjectType>(object: CadTypeMap[T] | CadShape): object is CadShape {
		return CoreType.isFunction((object as CadShape).ShapeType);
	}
}
