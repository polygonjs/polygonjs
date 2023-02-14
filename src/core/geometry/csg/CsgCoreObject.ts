import {geometries} from '@jscad/modeling';
import {Vector3} from 'three';
import {geom2Positions} from './toObject3D/CsgGeom2ToObject3D';
import {geom3Positions} from './toObject3D/CsgGeom3ToObject3D';
import {path2Positions} from './toObject3D/CsgPath2ToObject3D';
export type CsgObject = geometries.geom3.Geom3 | geometries.geom2.Geom2 | geometries.path2.Path2;

export class CsgCoreObject {
	constructor(private _object: CsgObject) {}
	dispose() {}

	object() {
		return this._object;
	}

	clone() {
		return CsgCoreObject.clone(this._object);
	}

	static clone<T extends CsgObject>(srcObject: T): T {
		return JSON.parse(JSON.stringify(srcObject));
		// if (jscad.geometries.geom3.isA(srcObject)) {
		// 	return jscad.geometries.geom3.clone(srcObject) as T;
		// }
		// if (jscad.geometries.geom2.isA(srcObject)) {
		// 	return jscad.geometries.geom2.clone(srcObject) as T;
		// }
		// if (jscad.geometries.path2.isA(srcObject)) {
		// 	return jscad.geometries.path2.clone(srcObject) as T;
		// }
		// return srcObject;
	}

	static points(csg: CsgObject): Vector3[] {
		if (geometries.geom3.isA(csg)) {
			return geom3Positions(csg);
		}
		if (geometries.geom2.isA(csg)) {
			return geom2Positions(csg);
		}
		if (geometries.path2.isA(csg)) {
			return path2Positions(csg);
		}
		return [];
	}
}
