import {BufferGeometry, Object3D, Mesh} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {PrimitiveAttributesDict, UserDataWithPrimitiveAttributes} from '../../entities/primitive/Common';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {BasePrimitiveAttribute, PrimitiveNumberAttribute} from '../../entities/primitive/PrimitiveAttribute';
import {primitivesCountFromObject} from '../../entities/primitive/CorePrimitiveUtils';
import {ThreejsVertex} from './ThreejsVertex';
import {NumericAttribValue} from '../../../../types/GlobalTypes';
import {AttributeNumericValuesOptions, attributeNumericValues} from '../../entities/utils/Common';
import {CoreEntityWithObject} from '../../CoreEntity';
import {ThreejsCoreObject} from './ThreejsCoreObject';

export interface BufferGeometryWithPrimitiveAttributes extends BufferGeometry {
	userData: UserDataWithPrimitiveAttributes;
}
const target: AttributeNumericValuesOptions = {
	attributeAdded: false,
	values: [],
};
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
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		attributes[attribName] = attribute;
	}
	static override addNumericAttribute(
		object: Object3D,
		attribName: string,
		size: number = 1,
		defaultValue: NumericAttribValue = 0
	) {
		const primitivesCount = this.entitiesCount(object);
		target.values = new Array(primitivesCount * size);
		attributeNumericValues(object, primitivesCountFromObject, size, defaultValue, target);

		const attribute: PrimitiveNumberAttribute = {
			isString: false,
			array: target.values,
			itemSize: size,
		};
		this.addAttribute(object, attribName, attribute);
	}
	static override attributes<T extends CoreObjectType>(
		object: ObjectContent<T>
	): PrimitiveAttributesDict | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData.primAttributes) {
			geometry.userData.primAttributes = {};
		}
		return geometry.userData.primAttributes;
	}

	//
	//
	// RELATED ENTITIES
	//
	//
	protected static stride() {
		return 3;
	}
	static override relatedVertexIds(
		object: ObjectContent<CoreObjectType>,
		primitiveIndex: number,
		target: number[]
	): void {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			target.length = 0;
			return;
		}
		const stride = this.stride();
		target.length = stride;
		for (let i = 0; i < stride; i++) {
			target[i] = primitiveIndex * stride + i;
		}
	}

	static override relatedVertexClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return ThreejsVertex as any as typeof CoreEntityWithObject<T>;
	}
	static override relatedObjectClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return ThreejsCoreObject as any as typeof CoreEntityWithObject<T>;
	}
}
