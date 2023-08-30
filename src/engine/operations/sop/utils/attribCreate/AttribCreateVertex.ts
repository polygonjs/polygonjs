import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreObject} from '../../../../../core/geometry/Object';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {CoreVertex} from '../../../../../core/geometry/Vertex';
import {VertexNumberAttribute} from '../../../../../core/geometry/VertexAttribute';

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
	let attribute = CoreVertex.attribute(geometry, attribName);
	if (!attribute) {
		const verticesCount = CoreVertex.verticesCount(geometry);
		const values = new Array(verticesCount * params.size).fill(value);
		attribute = new VertexNumberAttribute(values, params.size);
		CoreVertex.addAttribute(geometry, attribName, attribute);
	}

	// set values
	if (params.group) {
		const vertices = coreObject.verticesFromGroup(params.group);
		for (let vertex of vertices) {
			vertex.setAttribValue(attribName, value);
		}
	} else {
		const vertices = coreObject.vertices();
		for (let vertex of vertices) {
			vertex.setAttribValue(attribName, value);
		}
	}
}
