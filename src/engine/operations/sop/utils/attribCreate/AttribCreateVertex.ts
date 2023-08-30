import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreObject} from '../../../../../core/geometry/Object';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {VertexNumberAttribute} from '../../../../../core/geometry/vertex/VertexAttribute';
import {verticesFromObject, verticesFromObjectFromGroup} from '../../../../../core/geometry/vertex/CoreVertexUtils';
import {coreVertexClassFactory} from '../../../../../core/geometry/CoreObjectFactory';

export function addVertexAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const coreObjects = coreGroup.threejsCoreObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (let coreObject of coreObjects) {
				_addAttributeToVertices(coreObject, params, false);
			}
			return;
		}
		case AttribType.STRING: {
			for (let coreObject of coreObjects) {
				_addAttributeToVertices(coreObject, params, true);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

function _addAttributeToVertices(coreObject: CoreObject, params: AttribCreateSopParams, isString: boolean) {
	const object = coreObject.object();
	if (!object) {
		return;
	}
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
		attribute = new VertexNumberAttribute(values, params.size);
		vertexClass.addAttribute(object, attribName, attribute);
	}

	// set values
	if (params.group) {
		const vertices = verticesFromObjectFromGroup(coreObject.object(), params.group);
		for (let vertex of vertices) {
			vertex.setAttribValue(attribName, value);
		}
	} else {
		const vertices = verticesFromObject(coreObject.object());
		for (let vertex of vertices) {
			vertex.setAttribValue(attribName, value);
		}
	}
}
