import {BufferAttribute, LineSegments, Vector3, Mesh} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {ThreejsPrimitive} from './ThreejsPrimitive';
import {Attribute} from '../../Attribute';

const _p0 = new Vector3();
const _p1 = new Vector3();
export class ThreejsPrimitiveLineSegment extends ThreejsPrimitive {
	constructor(object: LineSegments, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static primitiveName() {
		return 'line';
	}

	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
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

	static override position<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		if (!(object && object.geometry)) {
			return target;
		}

		const positionAttribute = (object as any as Mesh).geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
		if (!positionAttribute) {
			return target;
		}
		const positionArray = positionAttribute.array;
		_p0.fromArray(positionArray, primitiveIndex * 3 + 0);
		_p1.fromArray(positionArray, primitiveIndex * 3 + 1);
		target.copy(_p0).add(_p1).divideScalar(2);
		return target;
	}
	static override normal<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		if (!(object && object.geometry)) {
			return target;
		}
		const positionAttribute = (object as any as Mesh).geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
		if (!positionAttribute) {
			return target;
		}
		const positionArray = positionAttribute.array;
		_p0.fromArray(positionArray, primitiveIndex * 3 + 0);
		_p1.fromArray(positionArray, primitiveIndex * 3 + 1);
		target.copy(_p1).sub(_p1).normalize();
		return target;
	}
	position(target: Vector3): Vector3 {
		return (this.constructor as typeof ThreejsPrimitiveLineSegment).position(this._object, this._index, target);
	}
	normal(target: Vector3): Vector3 {
		return (this.constructor as typeof ThreejsPrimitiveLineSegment).normal(this._object, this._index, target);
	}
	static override computeVertexNormalsIfAttributeVersionChanged<T extends CoreObjectType>(object: ObjectContent<T>) {}
	protected static override stride() {
		return 2;
	}
}
