import {LineSegments, Vector3} from 'three';
// import {BufferGeometryWithPrimitiveAttributes} from '../primitive/Common';
// import {CoreFace} from '../primitive/CoreFace';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import { CoreThreejsPrimitive } from './CoreThreejsPrimitive';

// const _coreFace = new CoreFace();
// const _triangle = new Triangle();

export class LineSegmentPrimitive extends CoreThreejsPrimitive {
	constructor(public override object: LineSegments, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as LineSegments).geometry;
		if (!geometry) {
			return 0;
		}
		const index = geometry.getIndex();
		if (!index) {
			return 0;
		}
		return index.count / 2;
	}

	position(target: Vector3) {
		console.warn('LineSegmentPrimitive.position not implemented');
		// _coreFace.setIndex(this._index, this._geometry as BufferGeometryWithPrimitiveAttributes);
		// _coreFace.center(target);
	}
	normal(target: Vector3): Vector3 {
		target.set(0, 0, 0);
		// _coreFace.setIndex(this._index, this._geometry as BufferGeometryWithPrimitiveAttributes);
		// _coreFace.triangle(_triangle);
		// _triangle.getNormal(target);
		return target;
	}
}
