import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {
	verticesFromObject,
	verticesFromObjectFromGroup,
} from '../../../../../core/geometry/entities/vertex/CoreVertexUtils';
import {coreVertexClassFactory} from '../../../../../core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../../core/geometry/ObjectContent';

export function addVertexAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const objects = coreGroup.allObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (let object of objects) {
				_addAttributeToVertices(object, params, false);
			}
			return;
		}
		case AttribType.STRING: {
			for (let object of objects) {
				_addAttributeToVertices(object, params, true);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

function _addAttributeToVertices<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopParams,
	isString: boolean
) {
	const value = isString
		? params.string
		: [params.value1, params.value2, params.value3, params.value4][params.size - 1];
	const attribName = CoreAttribute.remapName(params.name);

	// add default if not found
	const vertexClass = coreVertexClassFactory(object);
	let attribute = vertexClass.attribute(object, attribName);
	if (!attribute) {
		const verticesCount = vertexClass.verticesCount(object);
		const values = new Array(verticesCount * params.size).fill(value);
		attribute = {array: values, itemSize: params.size, isString: isString};
		vertexClass.addAttribute(object, attribName, attribute);
	}

	// set values
	if (params.group) {
		const vertices = verticesFromObjectFromGroup(object, params.group);
		for (let vertex of vertices) {
			vertex.setAttribValue(attribName, value);
		}
	} else {
		const vertices = verticesFromObject(object);
		for (let vertex of vertices) {
			vertex.setAttribValue(attribName, value);
		}
	}
}
