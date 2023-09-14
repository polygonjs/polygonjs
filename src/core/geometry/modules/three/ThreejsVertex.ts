import {BufferGeometry, Object3D, Mesh, Vector3, BufferAttribute} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {VertexAttributesDict, UserDataWithVertexAttributes} from '../../entities/vertex/Common';
import {BaseVertexAttribute} from '../../entities/vertex/VertexAttribute';
import {primitiveInstanceFactory, primitiveVerticesCountFactory} from './ThreeModule';
import type {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import type {TypedCorePoint} from '../../entities/point/CorePoint';

export interface BufferGeometryWithVertexAttributes extends BufferGeometry {
	userData: UserDataWithVertexAttributes;
}

export class ThreejsVertex extends CoreVertex<CoreObjectType.THREEJS> {
	protected _geometry?: BufferGeometry;

	constructor(object: Object3D, index: number) {
		super(object, index);
		this._updateGeometry();
	}
	override setIndex(index: number, object?: Object3D) {
		this._index = index;
		if (object) {
			this._object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = (this._object as Mesh).geometry as BufferGeometryWithVertexAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute(object: Object3D, attribName: string, attribute: BaseVertexAttribute) {
		const geometry = (object as Mesh).geometry as BufferGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData) {
			console.warn('geometry has no userData');
			return;
		}
		if (!geometry.userData.vertexAttributes) {
			geometry.userData.vertexAttributes = {};
		}
		geometry.userData.vertexAttributes[attribName] = attribute;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		return geometry.userData.vertexAttributes;
	}
	static override indexAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>
	): BufferAttribute | undefined | null {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		return geometry.getIndex();
	}
	static override setIndexAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: BufferAttribute | number[]
	): BufferAttribute | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		geometry.setIndex(index);
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return 0;
		}
		const index = geometry.getIndex();
		if (!index) {
			return 0;
		}
		return index.count;
	}
	override position(target: Vector3) {
		console.warn('CoreThreejsVertex.position not implemented');
	}
	override normal(target: Vector3): Vector3 {
		console.warn('CoreThreejsVertex.normal not implemented');
		return target;
	}
	//
	//
	// RELATED ENTITIES
	//
	//
	override relatedPrimitives<T extends CoreObjectType>(): CorePrimitive<T>[] {
		if (!this._object) {
			return [];
		}
		const index = this._index * primitiveVerticesCountFactory(this._object);
		const primitive = primitiveInstanceFactory(this._object, index) as CorePrimitive<T> | undefined;
		if (!primitive) {
			return [];
		}
		return [primitive];
	}
	override relatedPoints<T extends CoreObjectType>(): TypedCorePoint<T>[] {
		if (!this._object) {
			return [];
		}
		const geometry = (this._object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return [];
		}
		const index = geometry.getIndex();
		if (!index) {
			return [];
		}
		const indexValue = index.array[this._index];
		const point = new ThreejsVertex(this._object as any as Mesh, indexValue) as any as TypedCorePoint<T>;
		return [point];
	}
}
