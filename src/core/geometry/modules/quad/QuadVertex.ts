import {Vector3} from 'three';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {UserDataWithVertexAttributes, VertexAttributesDict} from '../../entities/vertex/Common';
import {verticesCountFromObject} from '../../entities/vertex/CoreVertexUtils';
import {QuadGeometry} from './QuadGeometry';
import {QuadObject} from './QuadObject';
import {BaseVertexAttribute, VertexNumberAttribute} from '../../entities/vertex/VertexAttribute';
import {AttributeNumericValuesOptions, attributeNumericValues} from '../../entities/utils/Common';
import {NumericAttribValue} from '../../../../types/GlobalTypes';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import type {TypedCorePoint} from '../../entities/point/CorePoint';
import {QuadPoint} from './QuadPoint';
import {QuadPrimitive} from './QuadPrimitive';

export interface QuadGeometryWithVertexAttributes extends QuadGeometry {
	userData: UserDataWithVertexAttributes;
}
const target: AttributeNumericValuesOptions = {
	attributeAdded: false,
	values: [],
};

export class QuadVertex extends CoreVertex<CoreObjectType.QUAD> {
	protected _geometry?: QuadGeometryWithVertexAttributes;
	constructor(object: QuadObject, index: number) {
		super(object, index);
		this._geometry = object.geometry as QuadGeometryWithVertexAttributes;
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
		const geometry = (this._object as QuadObject).geometry as QuadGeometryWithVertexAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BaseVertexAttribute
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
		const verticesCount = this.verticesCount(object);
		target.values = new Array(verticesCount * size);
		attributeNumericValues(object, verticesCountFromObject, size, defaultValue, target);

		const attribute: VertexNumberAttribute = {
			isString: false,
			array: target.values,
			itemSize: size,
		};
		this.addAttribute(object, attribName, attribute);
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object as any as QuadObject).geometry.index.length;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		const geometry = (object as any as QuadObject).geometry as QuadGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData.vertexAttributes) {
			geometry.userData.vertexAttributes = {};
		}
		return geometry.userData.vertexAttributes;
	}
	override position(target: Vector3): Vector3 {
		console.warn('QuadVertex.position not implemented');
		return target;
	}
	override normal(target: Vector3): Vector3 {
		console.warn('QuadVertex.normal not implemented');
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
		const index = Math.floor(this._index / 4);
		const primitive = new QuadPrimitive(this._object as any as QuadObject, index) as CorePrimitive<T> | undefined;
		if (!primitive) {
			return [];
		}
		return [primitive];
	}
	override relatedPoints<T extends CoreObjectType>(): TypedCorePoint<T>[] {
		if (!this._object) {
			return [];
		}
		const geometry = (this._object as any as QuadObject).geometry as QuadGeometry | undefined;
		if (!geometry) {
			return [];
		}
		const indexArray = geometry.index;
		const indexValue = indexArray[this._index];
		const point = new QuadPoint(this._object as any as QuadObject, indexValue) as any as TypedCorePoint<T>;
		return [point];
	}
}
