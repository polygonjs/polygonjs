import {Vector3} from 'three';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../ObjectContent';
import {TetObject} from './TetObject';
import {TetGeometry} from './TetGeometry';
import {tetCenter} from './utils/tetCenter';
import {tetObjectFromPrimitives} from './builders/TetPrimitiveBuilder';
import {BasePrimitiveAttribute, PrimitiveNumberAttribute} from '../../entities/primitive/PrimitiveAttribute';
import {NumericAttribValue} from '../../../../types/GlobalTypes';
import {PrimitiveAttributesDict, UserDataWithPrimitiveAttributes} from '../../entities/primitive/Common';
import {AttributeNumericValuesOptions, attributeNumericValues} from '../../entities/utils/Common';
import {primitivesCountFromObject} from '../../entities/primitive/CorePrimitiveUtils';

export interface TetGeometryWithPrimitiveAttributes extends TetGeometry {
	userData: UserDataWithPrimitiveAttributes;
}
const target: AttributeNumericValuesOptions = {
	attributeAdded: false,
	values: [],
};
export class TetPrimitive extends CorePrimitive<CoreObjectType.TET> {
	// public override _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(object: TetObject, index: number) {
		super(object, index);
		// this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	geometry() {
		return (this._object as TetObject).geometry;
	}
	override builder<T extends CoreObjectType>() {
		return tetObjectFromPrimitives as any as ObjectBuilder<T>;
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object as any as TetObject).tetGeometry().tetsCount();
	}
	static position<T extends CoreObjectType>(
		tetObject: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		if (!(tetObject && tetObject.geometry)) {
			return target;
		}
		tetCenter((tetObject as any as TetObject).geometry, primitiveIndex, target);
		return target;
	}
	//
	//
	// ATTRIBUTES
	//
	//
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
		const verticesCount = this.entitiesCount(object);
		target.values = new Array(verticesCount * size);
		attributeNumericValues(object, primitivesCountFromObject, size, defaultValue, target);

		const attribute: PrimitiveNumberAttribute = {
			isString: false,
			array: target.values,
			itemSize: size,
		};
		this.addAttribute(object, attribName, attribute);
	}
	static attributesFromGeometry(geometry: TetGeometry): PrimitiveAttributesDict | undefined {
		if (!geometry.userData.primAttributes) {
			geometry.userData.primAttributes = {};
		}
		return geometry.userData.primAttributes;
	}
	static override attributes<T extends CoreObjectType>(
		object: ObjectContent<T>
	): PrimitiveAttributesDict | undefined {
		const geometry = (object as any as TetObject).geometry as TetGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		return this.attributesFromGeometry(geometry);
	}

	//
	//
	// POSITION AND NORMAL
	//
	//
	position(target: Vector3): Vector3 {
		return (this.constructor as typeof TetPrimitive).position(this._object, this._index, target);
	}
	normal(target: Vector3): Vector3 {
		target.set(0, 1, 0);
		return target;
	}
}
