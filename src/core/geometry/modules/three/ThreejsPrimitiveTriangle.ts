import {Triangle, Vector3, Mesh, BufferAttribute, BufferGeometry} from 'three';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../ObjectContent';
import {ThreejsPrimitive} from './ThreejsPrimitive';
import {threeMeshFromPrimitives} from './builders/Mesh';
import {Attribute} from '../../Attribute';

const _triangle = new Triangle();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const normalsComputedWithPositionAttributeVersion: Map<string, number> = new Map();
export class ThreejsPrimitiveTriangle extends ThreejsPrimitive {
	constructor(object: Mesh, index: number) {
		super(object, index);
		this._geometry = object.geometry;
	}
	static primitiveName() {
		return 'triangle';
	}

	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
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
		_p2.fromArray(positionArray, primitiveIndex * 3 + 2);
		target.copy(_p0).add(_p1).add(_p2).divideScalar(3);
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
		_triangle.a.fromArray(positionArray, primitiveIndex * 3 + 0);
		_triangle.b.fromArray(positionArray, primitiveIndex * 3 + 1);
		_triangle.c.fromArray(positionArray, primitiveIndex * 3 + 2);
		_triangle.getNormal(target);
		return target;
	}
	position(target: Vector3): Vector3 {
		return (this.constructor as typeof ThreejsPrimitiveTriangle).position(this._object, this._index, target);
	}
	normal(target: Vector3): Vector3 {
		return (this.constructor as typeof ThreejsPrimitiveTriangle).normal(this._object, this._index, target);
	}
	static override computeVertexNormalsIfAttributeVersionChanged<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return null;
		}
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		if (!positionAttribute) {
			return;
		}
		if (!(positionAttribute instanceof BufferAttribute)) {
			return;
		}
		let lastVersion = normalsComputedWithPositionAttributeVersion.get(geometry.uuid);
		if (lastVersion == null || lastVersion != positionAttribute.version) {
			geometry.computeVertexNormals();
			normalsComputedWithPositionAttributeVersion.set(geometry.uuid, positionAttribute.version);
		}
	}
	override builder<T extends CoreObjectType>() {
		return threeMeshFromPrimitives as any as ObjectBuilder<T>;
	}
	protected static override stride() {
		return 3;
	}
}

export function triangleArea(triangle: ThreejsPrimitiveTriangle): number {
	const positionAttribute = (triangle.object() as Mesh).geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	const index = (triangle.object() as Mesh).geometry.index;
	if (!(positionAttribute && index)) {
		return 0;
	}
	const primitiveIndex = triangle.index();
	const positionArray = positionAttribute.array;
	const indexArray = index.array;
	_triangle.a.fromArray(positionArray, indexArray[primitiveIndex * 3 + 0] * 3);
	_triangle.b.fromArray(positionArray, indexArray[primitiveIndex * 3 + 1] * 3);
	_triangle.c.fromArray(positionArray, indexArray[primitiveIndex * 3 + 2] * 3);
	return _triangle.getArea();
}
