import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CadObject} from './CadObject';
import {CadGeometryType} from './CadCommon';

export class CadPrimitive<T extends CadGeometryType> extends CorePrimitive<CoreObjectType.CAD> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(object: CadObject<T>, index: number) {
		super(object, index);
		// this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	geometry() {
		return (this._object as CadObject<CadGeometryType>).geometry;
	}
	position(target: Vector3) {
		console.warn('CadPrimitive.position not implemented');
		// _coreFace.setIndex(this._index, this._geometry as QuadGeometryWithPrimitiveAttributes);
		// _coreFace.center(target);
	}
	normal(target: Vector3): Vector3 {
		// target.set(0, 0, 0);
		console.warn('CadPrimitive.normal not implemented');
		// _coreFace.setIndex(this._index, this._geometry as QuadGeometryWithPrimitiveAttributes);
		// _coreFace.triangle(_triangle);
		// _triangle.getNormal(target);
		return target;
	}
}
