import {LineSegments, Vector3} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {ThreejsPrimitive} from './ThreejsPrimitive';

export class ThreejsPrimitiveLineSegment extends ThreejsPrimitive {
	constructor(object: LineSegments, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static primitiveName() {
		return 'line';
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

	position(target: Vector3): Vector3 {
		console.warn('LineSegmentPrimitive.position not implemented');
		return target;
	}
	normal(target: Vector3): Vector3 {
		target.set(0, 0, 0);
		return target;
	}
	static override computeVertexNormalsIfAttributeVersionChanged<T extends CoreObjectType>(object: ObjectContent<T>) {}
	protected override stride() {
		return 2;
	}
}
