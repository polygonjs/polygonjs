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
import {QuadPoint} from './QuadPoint';
import {QuadPrimitive} from './QuadPrimitive';
import {CoreEntityWithObject} from '../../CoreEntity';

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
		const verticesCount = this.entitiesCount(object);
		target.values = new Array(verticesCount * size);
		attributeNumericValues(object, verticesCountFromObject, size, defaultValue, target);

		const attribute: VertexNumberAttribute = {
			isString: false,
			array: target.values,
			itemSize: size,
		};
		this.addAttribute(object, attribName, attribute);
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
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
	static override relatedPrimitiveIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		vertexIndex: number,
		target: number[]
	): void {
		target.length = 1;
		const index = Math.floor(vertexIndex / 4);
		target[0] = index;
	}

	static override relatedPointIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		vertexIndex: number,
		target: number[]
	): void {
		target.length = 0;

		const geometry = (object as any as QuadObject).geometry as QuadGeometry | undefined;
		if (!geometry) {
			return;
		}
		const indexArray = geometry.index;
		const indexValue = indexArray[vertexIndex];
		target[0] = indexValue;
	}
	static override relatedPointClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return QuadPoint as any as typeof CoreEntityWithObject<T>;
	}
	static override relatedPrimitiveClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return QuadPrimitive as any as typeof CoreEntityWithObject<T>;
	}
}
