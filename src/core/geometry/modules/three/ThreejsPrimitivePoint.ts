import {Vector3, Points, BufferAttribute, Mesh} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {ThreejsPrimitive} from './ThreejsPrimitive';
import {Attribute} from '../../Attribute';

const _p0 = new Vector3();
export class ThreejsPrimitivePoint extends ThreejsPrimitive {
	constructor(object: Points, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static primitiveName() {
		return 'point';
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
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
		target.copy(_p0);
		return target;
	}
	static override normal<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		return target.set(0, 1, 0);
	}
	position(target: Vector3): Vector3 {
		return (this.constructor as typeof ThreejsPrimitivePoint).position(this._object, this._index, target);
	}
	normal(target: Vector3): Vector3 {
		return (this.constructor as typeof ThreejsPrimitivePoint).normal(this._object, this._index, target);
	}
	static override computeVertexNormalsIfAttributeVersionChanged<T extends CoreObjectType>(object: ObjectContent<T>) {}
	protected static override stride() {
		return 1;
	}
}
