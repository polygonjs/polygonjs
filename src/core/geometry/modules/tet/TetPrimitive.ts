import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TetObject} from './TetObject';

export class TetPrimitive extends CorePrimitive<CoreObjectType.TET> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor( object: TetObject, index: number) {
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
		// _coreFace.setIndex(this._index, this._geometry as QuadGeometryWithPrimitiveAttributes);
		// _coreFace.center(target);
	}
	normal(target: Vector3): Vector3 {
		// target.set(0, 0, 0);
		console.warn('TetPrimitive.normal not implemented');
		// _coreFace.setIndex(this._index, this._geometry as QuadGeometryWithPrimitiveAttributes);
		// _coreFace.triangle(_triangle);
		// _triangle.getNormal(target);
		return target;
	}
}
