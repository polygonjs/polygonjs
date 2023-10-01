import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CsgPrimitive} from './CsgPrimitive';
import {CsgGeometryType, CsgTypeMap} from './CsgCommon';
import {CsgObject} from './CsgObject';

export class CsgPrimitiveGeom3 extends CsgPrimitive<CsgGeometryType.GEOM3> {
	constructor(object: CsgObject<CsgGeometryType.GEOM3>, index: number) {
		super(object, index);
	}
	static primitiveName() {
		return 'polygon';
	}

	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const csgOobject = object as any as CsgObject<CsgGeometryType.GEOM3>;
		const geometry = csgOobject.geometry as CsgTypeMap[CsgGeometryType.GEOM3];
		return geometry.polygons.length;
	}
	// position(target: Vector3): Vector3 {
	// 	console.warn('CsgPrimitiveGeom3.position not implemented');
	// 	return target;
	// }
	// normal(target: Vector3): Vector3 {
	// 	console.warn('CsgPrimitiveGeom3.normal not implemented');
	// 	return target;
	// }
}
