import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {SDFObject} from './SDFObject';

export class SDFPrimitive extends CorePrimitive<CoreObjectType.SDF> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(object: SDFObject, index: number) {
		super(object, index);
		// this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	geometry() {
		return (this._object as SDFObject).geometry;
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	position(target: Vector3): Vector3 {
		console.warn('SDFPrimitive.position not implemented');
		return target;
	}
	normal(target: Vector3): Vector3 {
		console.warn('SDFPrimitive.normal not implemented');
		return target;
	}
}
