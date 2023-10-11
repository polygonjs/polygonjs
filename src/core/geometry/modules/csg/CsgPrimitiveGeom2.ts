import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CsgPrimitive} from './CsgPrimitive';
import {CsgGeometryType, CsgTypeMap} from './CsgCommon';
import {CsgObject} from './CsgObject';

export class CsgPrimitiveGeom2 extends CsgPrimitive<CsgGeometryType.GEOM2> {
	constructor(object: CsgObject<CsgGeometryType.GEOM2>, index: number) {
		super(object, index);
		// this._geometry = object.geometry;
	}
	static primitiveName() {
		return 'side';
	}

	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const csgOobject = object as any as CsgObject<CsgGeometryType.GEOM2>;
		const geometry = csgOobject.geometry as CsgTypeMap[CsgGeometryType.GEOM2];
		return geometry.sides.length;
	}

	// position(target: Vector3): Vector3 {
	// 	console.warn('CsgPrimitiveGeom2.position not implemented');
	// 	return target;
	// }
	// normal(target: Vector3): Vector3 {
	// 		console.warn('CsgPrimitiveGeom2.normal not implemented');
	// 	return target;
	// }
}
