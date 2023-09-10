import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {
	primitivesFromObject,
	primitivesFromObjectFromGroup,
} from '../../../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {corePrimitiveClassFactory} from '../../../../../core/geometry/CoreObjectFactory';
import {BaseCoreObject} from '../../../../../core/geometry/entities/object/BaseCoreObject';
import {CoreObjectType} from '../../../../../core/geometry/ObjectContent';

export function addPrimitiveAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const coreObjects = coreGroup.allCoreObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (let coreObject of coreObjects) {
				_addAttributeToPrimitives(coreObject, params, false);
			}
			return;
		}
		case AttribType.STRING: {
			for (let coreObject of coreObjects) {
				_addAttributeToPrimitives(coreObject, params, true);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

function _addAttributeToPrimitives(
	coreObject: BaseCoreObject<CoreObjectType>,
	params: AttribCreateSopParams,
	isString: boolean
) {
	const object = coreObject.object();

	const value = isString
		? params.string
		: [params.value1, params.value2, params.value3, params.value4][params.size - 1];
	const attribName = CoreAttribute.remapName(params.name);

	// add default if not found
	const primitiveClass = corePrimitiveClassFactory(object);
	let attribute = primitiveClass.attribute(object, attribName);
	if (!attribute) {
		const primitivesCount = primitiveClass.primitivesCount(object);
		const values = new Array(primitivesCount * params.size).fill(value);
		attribute = isString
			? {array: values, itemSize: 1, isString}
			: {array: values, itemSize: params.size, isString};
		primitiveClass.addAttribute(object, attribName, attribute);
	}

	// set values
	if (params.group) {
		const primitives = primitivesFromObjectFromGroup(coreObject.object(), params.group);
		for (let primitive of primitives) {
			primitive.setAttribValue(attribName, value);
		}
	} else {
		const primitives = primitivesFromObject(coreObject.object());
		for (let primitive of primitives) {
			primitive.setAttribValue(attribName, value);
		}
	}
}
