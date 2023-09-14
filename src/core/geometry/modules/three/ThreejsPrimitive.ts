import {BufferGeometry, Object3D, Mesh} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {PrimitiveAttributesDict, UserDataWithPrimitiveAttributes} from '../../entities/primitive/Common';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {BasePrimitiveAttribute} from '../../entities/primitive/PrimitiveAttribute';
import type {CoreVertex} from '../../entities/vertex/CoreVertex';
import {ThreejsVertex} from './ThreejsVertex';

export interface BufferGeometryWithPrimitiveAttributes extends BufferGeometry {
	userData: UserDataWithPrimitiveAttributes;
}

export abstract class ThreejsPrimitive extends CorePrimitive<CoreObjectType.THREEJS> {
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
		const geometry = (this._object as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute(object: Object3D, attribName: string, attribute: BasePrimitiveAttribute) {
		const geometry = (object as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData) {
			console.warn('geometry has no userData');
			return;
		}
		if (!geometry.userData.primAttributes) {
			geometry.userData.primAttributes = {};
		}
		geometry.userData.primAttributes[attribName] = attribute;
	}
	static override attributes<T extends CoreObjectType>(
		object: ObjectContent<T>
	): PrimitiveAttributesDict | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		return geometry.userData.primAttributes;
	}
	//
	//
	// RELATED ENTITIES
	//
	//
	protected stride() {
		return 3;
	}
	override relatedVertices(): CoreVertex<CoreObjectType>[] {
		if (!this._object) {
			return [];
		}
		const geometry = (this._object as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return [];
		}
		const index = geometry.index;
		if (!index) {
			return [];
		}
		const stride = this.stride();
		const vertices: CoreVertex<CoreObjectType>[] = [];
		for (let i = 0; i < stride; i++) {
			const vertex = new ThreejsVertex(this._object as Mesh, this._index * stride + i);
			vertices.push(vertex);
		}
		return vertices;
	}
}
