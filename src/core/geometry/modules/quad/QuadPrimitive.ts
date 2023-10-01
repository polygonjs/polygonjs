import {Vector3, BufferAttribute, Triangle} from 'three';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../ObjectContent';
import {QuadObject} from './QuadObject';
import {QuadGeometry} from './QuadGeometry';
import {quadObjectFromPrimitives} from './builders/QuadPrimitiveBuilder';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {PrimitiveAttributesDict, UserDataWithPrimitiveAttributes} from '../../entities/primitive/Common';
import {AttributeNumericValuesOptions, attributeNumericValues} from '../../entities/utils/Common';
import {BasePrimitiveAttribute, PrimitiveNumberAttribute} from '../../entities/primitive/PrimitiveAttribute';
import type {CoreVertex} from '../../entities/vertex/CoreVertex';
import {QuadVertex} from './QuadVertex';
import {NumericAttribValue} from '../../../../types/GlobalTypes';
import {primitivesCountFromObject} from '../../entities/primitive/CorePrimitiveUtils';
import {Attribute} from '../../Attribute';
const _triangle = new Triangle();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();
const _n0 = new Vector3();
const _n1 = new Vector3();
export interface QuadGeometryWithPrimitiveAttributes extends QuadGeometry {
	userData: UserDataWithPrimitiveAttributes;
}
const target: AttributeNumericValuesOptions = {
	attributeAdded: false,
	values: [],
};
const stride = 4;

export class QuadPrimitive extends CorePrimitive<CoreObjectType.QUAD> {
	protected _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(object: QuadObject, index: number) {
		super(object, index);
		this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	override setIndex(index: number, object?: QuadObject) {
		this._index = index;
		if (object) {
			this._object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = (this._object as QuadObject).geometry as QuadGeometryWithPrimitiveAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	override builder<T extends CoreObjectType>() {
		return quadObjectFromPrimitives as any as ObjectBuilder<T>;
	}
	static override addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BasePrimitiveAttribute
	) {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		attributes[attribName] = attribute;
	}
	static override addNumericAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		size: number = 1,
		defaultValue: NumericAttribValue = 0
	) {
		const verticesCount = this.primitivesCount(object);
		target.values = new Array(verticesCount * size);
		attributeNumericValues(object, primitivesCountFromObject, size, defaultValue, target);

		const attribute: PrimitiveNumberAttribute = {
			isString: false,
			array: target.values,
			itemSize: size,
		};
		this.addAttribute(object, attribName, attribute);
	}
	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object as any as QuadObject).geometry.quadsCount();
	}
	static override attributes<T extends CoreObjectType>(
		object: ObjectContent<T>
	): PrimitiveAttributesDict | undefined {
		const geometry = (object as any as QuadObject).geometry as QuadGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData.primAttributes) {
			geometry.userData.primAttributes = {};
		}
		return geometry.userData.primAttributes;
	}

	static position<T extends CoreObjectType>(
		quadObject: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		if (!(quadObject && quadObject.geometry)) {
			return target;
		}
		const positionAttribute = (quadObject as any as QuadObject).geometry.attributes[Attribute.POSITION] as
			| BufferAttribute
			| undefined;
		if (!positionAttribute) {
			return target;
		}
		const positionArray = positionAttribute.array;
		const i0 = primitiveIndex * stride + 0;
		const i1 = primitiveIndex * stride + 1;
		const i2 = primitiveIndex * stride + 2;
		const i3 = primitiveIndex * stride + 3;
		const index = (quadObject as any as QuadObject).geometry.index;
		_p0.fromArray(positionArray, index[i0] * 3);
		_p1.fromArray(positionArray, index[i1] * 3);
		_p2.fromArray(positionArray, index[i2] * 3);
		_p3.fromArray(positionArray, index[i3] * 3);
		target.copy(_p0).add(_p1).add(_p2).add(_p3).divideScalar(4);
		return target;
	}
	position(target: Vector3): Vector3 {
		return (this.constructor as typeof QuadPrimitive).position(this._object, this._index, target);
	}
	normal(target: Vector3): Vector3 {
		if (!this._geometry) {
			return target;
		}
		const positionAttribute = this._geometry.attributes[Attribute.POSITION] as BufferAttribute | undefined;
		if (!positionAttribute) {
			return target;
		}
		const positionArray = positionAttribute.array;
		const i0 = this._index * stride + 0;
		const i1 = this._index * stride + 1;
		const i2 = this._index * stride + 2;
		const i3 = this._index * stride + 3;
		const index = this._geometry.index;
		_triangle.a.fromArray(positionArray, index[i0] * 3);
		_triangle.b.fromArray(positionArray, index[i1] * 3);
		_triangle.c.fromArray(positionArray, index[i2] * 3);
		_triangle.getNormal(_n0);
		_triangle.a.fromArray(positionArray, index[i2] * 3);
		_triangle.b.fromArray(positionArray, index[i3] * 3);
		_triangle.c.fromArray(positionArray, index[i0] * 3);
		_triangle.getNormal(_n1);
		return target.copy(_n0).add(_n1).divideScalar(2);
	}
	//
	//
	// RELATED ENTITIES
	//
	//

	override relatedVertices(): CoreVertex<CoreObjectType>[] {
		if (!this._object) {
			return [];
		}
		const geometry = (this._object as QuadObject).geometry as QuadGeometry | undefined;
		if (!geometry) {
			return [];
		}
		const vertices: CoreVertex<CoreObjectType>[] = [];
		for (let i = 0; i < stride; i++) {
			const vertex = new QuadVertex(this._object as QuadObject, this._index * stride + i);
			vertices.push(vertex);
		}
		return vertices;
	}
}
