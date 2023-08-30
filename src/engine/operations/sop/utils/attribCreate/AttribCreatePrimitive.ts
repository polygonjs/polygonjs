import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreObject} from '../../../../../core/geometry/Object';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {CorePrimitive} from '../../../../../core/geometry/Primitive';
import {PrimitiveNumberAttribute} from '../../../../../core/geometry/PrimitiveAttribute';

export function addPrimitiveAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const coreObjects = coreGroup.threejsCoreObjects();
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

function _addAttributeToPrimitives(coreObject: CoreObject, params: AttribCreateSopParams, isString: boolean) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	const value = isString
		? params.string
		: [params.value1, params.value2, params.value3, params.value4][params.size - 1];
	const geometry = coreGeometry.geometry();
	const attribName = CoreAttribute.remapName(params.name);

	// add default if not found
	let attribute = CorePrimitive.attribute(geometry, attribName);
	if (!attribute) {
		const primitivesCount = CorePrimitive.primitivesCount(geometry);
		const values = new Array(primitivesCount * params.size).fill(value);
		attribute = new PrimitiveNumberAttribute(values, params.size);
		CorePrimitive.addAttribute(geometry, attribName, attribute);
	}

	// set values
	if (params.group) {
		const primitives = coreObject.primitivesFromGroup(params.group);
		for (let primitive of primitives) {
			primitive.setAttribValue(attribName, value);
		}
	} else {
		const primitives = coreObject.primitives();
		for (let primitive of primitives) {
			primitive.setAttribValue(attribName, value);
		}
	}
}

// function _addStringAttributeToPrimitives(coreObject: CoreObject, params: AttribCreateSopParams) {
// 	const coreGeometry = coreObject.coreGeometry();
// 	if (!coreGeometry) {
// 		return;
// 	}
// 	const value = params.string;
// 	const geometry = coreGeometry.geometry();
// 	const attribName = CoreAttribute.remapName(params.name);

// 	// add default if not found
// 	let attribute = CorePrimitive.attribute(geometry, attribName);
// 	if (!attribute) {
// 		const primitivesCount = CorePrimitive.primitivesCount(geometry);
// 		const values = new Array(primitivesCount * params.size).fill(value);
// 		attribute = new PrimitiveNumberAttribute(values, params.size);
// 		CorePrimitive.addAttribute(geometry, attribName, attribute);
// 	}

// 	// set values
// 	if (params.group) {
// 		const primitives = coreObject.primitivesFromGroup(params.group);
// 		for (let primitive of primitives) {
// 			primitive.setAttribValue(attribName, value);
// 		}
// 	} else {
// 		const primitives = coreObject.primitives();
// 		for (let primitive of primitives) {
// 			primitive.setAttribValue(attribName, value);
// 		}
// 	}
// }
