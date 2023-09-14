import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CsgObject} from './CsgObject';
import {CsgGeometryType} from './CsgCommon';

export class CsgPrimitive<T extends CsgGeometryType> extends CorePrimitive<CoreObjectType.CSG> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(object: CsgObject<T>, index: number) {
		super(object, index);
		// this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	geometry() {
		return (this._object as CsgObject<CsgGeometryType>).geometry;
	}
	position(target: Vector3) {
		console.warn('CsgPrimitive.position not implemented');
	}
	normal(target: Vector3): Vector3 {
		console.warn('CsgPrimitive.normal not implemented');
		return target;
	}
}
