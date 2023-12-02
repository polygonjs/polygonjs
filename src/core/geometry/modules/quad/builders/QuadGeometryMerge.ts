import {arrayIsEqual} from '../../../../ArrayUtils';
import {QuadGeometry} from '../QuadGeometry';
import {QuadObject} from '../QuadObject';
import {QuadPoint} from '../QuadPoint';
import {QuadVertex} from '../QuadVertex';
import {QuadPrimitive} from '../QuadPrimitive';
import {BufferAttribute} from 'three';
import {BasePrimitiveAttribute} from '../../../entities/primitive/PrimitiveAttribute';

function _attributesAreTheSame(
	quadObjects: QuadObject[],
	entityClass: typeof QuadPoint | typeof QuadVertex | typeof QuadPrimitive
) {
	const firstGeometryPointAttributeNames = entityClass.attributeNames(quadObjects[0]);
	for (const quadObject of quadObjects) {
		const attribNames = entityClass.attributeNames(quadObject);
		if (!arrayIsEqual(firstGeometryPointAttributeNames, attribNames)) {
			return false;
		}
	}
	return true;
}

function _mergePointAttributes(quadObjects: QuadObject[], target: QuadGeometry) {
	const attributeNames = QuadPoint.attributeNames(quadObjects[0]);
	let i = 0;
	for (const attributeName of attributeNames) {
		_mergePointAttribute(quadObjects, attributeName, i == 0, target);
		i++;
	}
}
function _mergePointAttribute(
	quadObjects: QuadObject[],
	attributeName: string,
	addIndex: boolean,
	target: QuadGeometry
) {
	const firstAttribute = QuadPoint.attribute(quadObjects[0], attributeName)!;
	const itemSize = firstAttribute.itemSize;
	const values: number[] = [];
	const indices: number[] = [];
	let indexOffset = 0;
	for (const object of quadObjects) {
		const attribute = QuadPoint.attribute(object, attributeName)!;
		const array = attribute.array;
		for (const item of array) {
			values.push(item);
		}

		if (addIndex) {
			const index = object.geometry.index;
			for (const indexItem of index) {
				indices.push(indexItem + indexOffset);
			}
		}

		indexOffset += attribute.count;
	}
	target.setAttribute(attributeName, new BufferAttribute(new Float32Array(values), itemSize));
	if (addIndex) {
		target.setIndex(indices);
	}
}
function _mergeAttributes(
	quadObjects: QuadObject[],
	entityClass: typeof QuadPrimitive | typeof QuadVertex,
	target: QuadGeometry
) {
	const attributeNames = entityClass.attributeNames(quadObjects[0]);
	for (const attributeName of attributeNames) {
		_mergeAttribute(quadObjects, attributeName, entityClass, target);
	}
}
function _mergeAttribute(
	quadObjects: QuadObject[],
	attributeName: string,
	entityClass: typeof QuadPrimitive | typeof QuadVertex,
	target: QuadGeometry
) {
	const firstAttribute = entityClass.attribute(quadObjects[0], attributeName)!;
	const {itemSize, isString} = firstAttribute;
	const values: number[] = [];
	for (const object of quadObjects) {
		const attribute = entityClass.attribute(object, attributeName)!;
		const array = attribute.array as number[];
		for (const item of array) {
			values.push(item);
		}
	}
	const dummyObject = new QuadObject(target);
	const attribute: BasePrimitiveAttribute = {
		isString,
		array: values,
		itemSize,
	};
	entityClass.addAttribute(dummyObject, attributeName, attribute);
}

export function quadGeomeryMerge(quadObjects: QuadObject[]): QuadGeometry | undefined {
	if (
		!(
			_attributesAreTheSame(quadObjects, QuadPoint) &&
			_attributesAreTheSame(quadObjects, QuadVertex) &&
			_attributesAreTheSame(quadObjects, QuadPrimitive)
		)
	) {
		return;
	}

	const mergedGeometry = new QuadGeometry();
	_mergePointAttributes(quadObjects, mergedGeometry);
	_mergeAttributes(quadObjects, QuadPrimitive, mergedGeometry);
	_mergeAttributes(quadObjects, QuadVertex, mergedGeometry);

	//
	return mergedGeometry;
}
