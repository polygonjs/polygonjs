import {CadGeometryType, CAD_GEOMETRY_TYPES_SET, CAD_GEOMETRY_TYPES_SET_SHAPE} from './CadCommon';
import type {CadGeometryTypeShape, CadTypeMap, CadShape} from './CadCommon';
import {isFunction} from '../../../Type';
import type {CadObject} from './CadObject';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';

export function isCADObject(o: ObjectContent<CoreObjectType>) {
	return CAD_GEOMETRY_TYPES_SET.has(o.type as CadGeometryType);
}
export class CoreCadType {
	static isPoint2d(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.POINT_2D> {
		return object.type == CadGeometryType.POINT_2D;
	}
	static isGeom2dCurve(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.CURVE_2D> {
		return object.type == CadGeometryType.CURVE_2D;
	}
	static isVertex(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.VERTEX> {
		return object.type == CadGeometryType.VERTEX;
	}
	static isEdge(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.EDGE> {
		return object.type == CadGeometryType.EDGE;
	}
	static isWire(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.WIRE> {
		return object.type == CadGeometryType.WIRE;
	}
	static isFace(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.FACE> {
		return object.type == CadGeometryType.FACE;
	}
	static isShell(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.SHELL> {
		return object.type == CadGeometryType.SHELL;
	}
	static isSolid(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.SOLID> {
		return object.type == CadGeometryType.SOLID;
	}
	static isCompsolid(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.COMPSOLID> {
		return object.type == CadGeometryType.COMPSOLID;
	}
	static isCompound(object: CadObject<CadGeometryType>): object is CadObject<CadGeometryType.COMPOUND> {
		return object.type == CadGeometryType.COMPOUND;
	}
	static isShape(
		object: CadObject<CadGeometryType>
	): object is
		| CadObject<CadGeometryType.VERTEX>
		| CadObject<CadGeometryType.EDGE>
		| CadObject<CadGeometryType.WIRE>
		| CadObject<CadGeometryType.FACE>
		| CadObject<CadGeometryType.SHELL>
		| CadObject<CadGeometryType.SOLID>
		| CadObject<CadGeometryType.COMPSOLID>
		| CadObject<CadGeometryType.COMPOUND> {
		return CAD_GEOMETRY_TYPES_SET_SHAPE.has(object.type as CadGeometryTypeShape);
	}
	static isGeometryShape<T extends CadGeometryType>(geometry: CadTypeMap[T] | CadShape): geometry is CadShape {
		return isFunction((geometry as CadShape).ShapeType);
	}
}
