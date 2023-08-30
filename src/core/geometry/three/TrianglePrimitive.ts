import {Triangle, Vector3, Mesh} from 'three';
import {CoreFace} from '../primitive/CoreFace';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {CoreThreejsPrimitive, BufferGeometryWithPrimitiveAttributes} from './CoreThreejsPrimitive';

const _coreFace = new CoreFace();
const _triangle = new Triangle();

export class TrianglePrimitive extends CoreThreejsPrimitive {
	constructor(public override object: Mesh, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry;
		if (!geometry) {
			return 0;
		}
		const index = geometry.getIndex();
		if (!index) {
			return 0;
		}
		return index.count / 3;
	}
	position(target: Vector3) {
		_coreFace.setIndex(this._index, this._geometry as BufferGeometryWithPrimitiveAttributes);
		_coreFace.center(target);
	}
	normal(target: Vector3): Vector3 {
		_coreFace.setIndex(this._index, this._geometry as BufferGeometryWithPrimitiveAttributes);
		_coreFace.triangle(_triangle);
		_triangle.getNormal(target);
		return target;
	}
}
