import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TetObject} from './TetObject';

export class TetPrimitive extends CorePrimitive<CoreObjectType.TET> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(object: TetObject, index: number) {
		super(object, index);
		// this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	geometry() {
		return (this._object as TetObject).geometry;
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	position(target: Vector3) {
		console.warn('TetPrimitive.position not implemented');
	}
	normal(target: Vector3): Vector3 {
		console.warn('TetPrimitive.normal not implemented');
		return target;
	}
}
