import {Color} from 'three';
import {geometries} from '@jscad/modeling';
export type CsgGeometry = geometries.path2.Path2 | geometries.geom2.Geom2 | geometries.geom3.Geom3;

export enum CsgGeometryType {
	PATH2 = 'CSGPath2',
	GEOM2 = 'CSGGeom2',
	GEOM3 = 'CSGGeom3',
	// UNKNOWN = 'unknown',
}
const CSG_GEOMETRY_TYPES: CsgGeometryType[] = [CsgGeometryType.PATH2, CsgGeometryType.GEOM2, CsgGeometryType.GEOM3];
export const CSG_GEOMETRY_TYPES_SET: Set<CsgGeometryType> = new Set(CSG_GEOMETRY_TYPES);

export interface CsgTypeMap {
	[CsgGeometryType.PATH2]: geometries.path2.Path2;
	[CsgGeometryType.GEOM2]: geometries.geom2.Geom2;
	[CsgGeometryType.GEOM3]: geometries.geom3.Geom3;
	// [CsgGeometryType.UNKNOWN]: undefined;
}

export interface CSGTesselationParams {
	facetAngle: number;
	wireframe: boolean;
	meshesColor: Color;
	linesColor: Color;
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
