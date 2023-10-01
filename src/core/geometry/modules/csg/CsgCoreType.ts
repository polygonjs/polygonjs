import {geometries} from '@jscad/modeling';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CsgGeometryType, CsgGeometry, CsgTypeMap, CSG_GEOMETRY_TYPES_SET} from './CsgCommon';

export function isCSGObject(o: ObjectContent<CoreObjectType>) {
	return CSG_GEOMETRY_TYPES_SET.has(o.type as CsgGeometryType);
}

export function csgIsPath2(geometry: CsgGeometry): geometry is geometries.path2.Path2 {
	// DO NOT use this function 'geometries.path2'
	// out of this file, as the input isn't type
	// and can therefore be misleading
	return geometries.path2.isA(geometry);
}
export function csgIsGeom2(geometry: CsgGeometry): geometry is geometries.geom2.Geom2 {
	// DO NOT use this function 'geometries.path2'
	// out of this file, as the input isn't type
	// and can therefore be misleading
	return geometries.geom2.isA(geometry);
}
export function csgIsGeom3(geometry: CsgGeometry): geometry is geometries.geom3.Geom3 {
	// DO NOT use this function 'geometries.path2'
	// out of this file, as the input isn't type
	// and can therefore be misleading
	return geometries.geom3.isA(geometry);
}

export function csgGeometryTypeFromGeometry<T extends CsgGeometryType>(geometry: CsgTypeMap[T]): T {
	if (csgIsPath2(geometry)) {
		return CsgGeometryType.PATH2 as T;
	}
	if (csgIsGeom2(geometry)) {
		return CsgGeometryType.GEOM2 as T;
	}
	if (csgIsGeom3(geometry)) {
		return CsgGeometryType.GEOM3 as T;
	}
	return CsgGeometryType.GEOM3 as T;
}
