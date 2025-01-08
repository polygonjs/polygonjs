import {Triangle, Vector3, Mesh, BufferAttribute, BufferGeometry} from 'three';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../ObjectContent';
import {ThreejsPrimitive} from './ThreejsPrimitive';
import {threeMeshFromPrimitives} from './builders/Mesh';
import {Attribute} from '../../Attribute';

const _triangle = new Triangle();

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
		setTriangle(object, primitiveIndex, _triangle);
		target.copy(_triangle.a).add(_triangle.b).add(_triangle.c).divideScalar(3);
		return target;
	}
	static override normal<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		setTriangle(object, primitiveIndex, _triangle);
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

	static setTriangle<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Triangle
	) {
		setTriangle(object, primitiveIndex, target);
	}
}

export function triangleArea(triangle: ThreejsPrimitiveTriangle): number {
	setTriangle(triangle.object(), triangle.index(), _triangle);
	return _triangle.getArea();
}

export function setTriangle<T extends CoreObjectType>(
	object: ObjectContent<T> | undefined,
	primitiveIndex: number,
	target: Triangle
) {
	if (!(object && object.geometry)) {
		return;
	}
	const geometry = (object as any as Mesh).geometry;
	const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
	if (!positionAttribute) {
		return;
	}
	const index = geometry.getIndex();
	if (!index) {
		return;
	}
	const indexArray = index.array;
	const positionArray = positionAttribute.array;
	target.a.fromArray(positionArray, indexArray[primitiveIndex * 3 + 0] * 3);
	target.b.fromArray(positionArray, indexArray[primitiveIndex * 3 + 1] * 3);
	target.c.fromArray(positionArray, indexArray[primitiveIndex * 3 + 2] * 3);
}
