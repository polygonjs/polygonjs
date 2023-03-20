import {Color} from 'three';
import type {geometries} from '@jscad/modeling';
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
