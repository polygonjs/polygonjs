import jscad from '@jscad/modeling';
import {CsgObject} from './CsgCoreObject';
import {geom3ToObject3D} from './toObject3D/CsgGeom3ToObject3D';
import {geom2ToObject3D} from './toObject3D/CsgGeom2ToObject3D';
import {path2ToObject3D} from './toObject3D/CsgPath2ToObject3D';

export enum CsgObjectType {
	GEOM3 = 'geom3',
	GEOM2 = 'geom2',
	PATH2 = 'path2',
	UNKNOWN = 'unknown',
}

export function csgObjectType(csg: CsgObject) {
	if (jscad.geometries.geom3.isA(csg)) {
		return CsgObjectType.GEOM3;
	}
	if (jscad.geometries.geom2.isA(csg)) {
		return CsgObjectType.GEOM2;
	}
	if (jscad.geometries.path2.isA(csg)) {
		return CsgObjectType.PATH2;
	}
	return CsgObjectType.UNKNOWN;
}

export function csgToObject3D(csg: CsgObject, facetAngle: number) {
	if (jscad.geometries.geom3.isA(csg)) {
		return geom3ToObject3D(csg, {facet: {angle: facetAngle}});
	}
	if (jscad.geometries.geom2.isA(csg)) {
		return geom2ToObject3D(csg);
	}
	if (jscad.geometries.path2.isA(csg)) {
		return path2ToObject3D(csg);
	}
	console.warn('no conversion method for', csg);
}
