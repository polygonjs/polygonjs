import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CsgPrimitive} from './CsgPrimitive';
import {CsgGeometryType, CsgTypeMap} from './CsgCommon';
import {CsgObject} from './CsgObject';

export class CsgPrimitivePath2 extends CsgPrimitive<CsgGeometryType.PATH2> {
	constructor(object: CsgObject<CsgGeometryType.PATH2>, index: number) {
		super(object, index);
	}
	static primitiveName() {
		return 'point';
	}

	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const csgOobject = object as any as CsgObject<CsgGeometryType.PATH2>;
		const geometry = csgOobject.geometry as CsgTypeMap[CsgGeometryType.PATH2];
		return geometry.points.length;
	}

	// position(target: Vector3): Vector3 {
	// 	console.warn('CsgPrimitivePath2.position not implemented');
	// 	return target;
	// }
	// normal(target: Vector3): Vector3 {
	// 	console.warn('CsgPrimitivePath2.normal not implemented');
	// 	return target;
	// }
}
