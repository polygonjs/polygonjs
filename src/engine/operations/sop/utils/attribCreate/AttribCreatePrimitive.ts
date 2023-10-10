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
import {CoreObjectType, ObjectContent} from '../../../../../core/geometry/ObjectContent';
import {CorePrimitive} from '../../../../../core/geometry/entities/primitive/CorePrimitive';

export function addPrimitiveAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const objects = coreGroup.allObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (let object of objects) {
				_addAttributeToPrimitives(object, params, false);
			}
			return;
		}
		case AttribType.STRING: {
			for (let object of objects) {
				_addAttributeToPrimitives(object, params, true);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

const _primitives: CorePrimitive<CoreObjectType>[] = [];
function _addAttributeToPrimitives<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopParams,
	isString: boolean
) {
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
		primitivesFromObjectFromGroup(object, params.group, _primitives);
		for (const primitive of _primitives) {
			primitive.setAttribValue(attribName, value);
		}
	} else {
		primitivesFromObject(object, _primitives);
		for (const primitive of _primitives) {
			primitive.setAttribValue(attribName, value);
		}
	}
}
