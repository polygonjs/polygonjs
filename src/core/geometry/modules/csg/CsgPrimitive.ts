import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType} from '../../ObjectContent';
import {CsgObject} from './CsgObject';
import {CsgTypeMap, CsgGeometryType} from './CsgCommon';

export class CsgPrimitive<T extends CsgGeometryType> extends CorePrimitive<CoreObjectType.CSG> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	protected _geometry: CsgTypeMap[T];
	constructor(object: CsgObject<T>, index: number) {
		super(object, index);
		this._geometry = object.geometry as CsgTypeMap[T];
		// this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	// static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
	// 	(object as any as CsgObject<CsgGeometryType>).geometry.
	// 	return 0;
	// }
	geometry() {
		return (this._object as CsgObject<CsgGeometryType>).geometry;
	}
	position(target: Vector3): Vector3 {
		console.warn('CsgPrimitive.position not implemented');
		return target;
	}
	normal(target: Vector3): Vector3 {
		console.warn('CsgPrimitive.normal not implemented');
		return target;
	}
}
