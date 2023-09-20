import {Vector3, Points} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {ThreejsPrimitive} from './ThreejsPrimitive';

export class ThreejsPrimitivePoint extends ThreejsPrimitive {
	constructor(object: Points, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static primitiveName() {
		return 'points';
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Points).geometry;
		if (!geometry) {
			return 0;
		}
		const index = geometry.getIndex();
		if (!index) {
			return 0;
		}
		return index.count;
	}
	position(target: Vector3): Vector3 {
		console.warn('PointPrimitive.position not implemented');
		return target;
	}
	normal(target: Vector3): Vector3 {
		console.warn('PointPrimitive.normal not implemented');
		target.set(0, 0, 0);
		return target;
	}
	static override computeVertexNormalsIfAttributeVersionChanged<T extends CoreObjectType>(object: ObjectContent<T>) {}
	protected override stride() {
		return 1;
	}
}
