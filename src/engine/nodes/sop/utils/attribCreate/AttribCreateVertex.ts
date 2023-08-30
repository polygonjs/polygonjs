import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreObject} from '../../../../../core/geometry/Object';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {ValueArrayByName, initArrayIfRequired} from './Common';
import {AttribCreateSopNodeParams} from '../../../../operations/sop/utils/attribCreate/Common';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {CoreVertex} from '../../../../../core/geometry/Vertex';
import {VertexNumberAttribute, VertexStringAttribute} from '../../../../../core/geometry/VertexAttribute';

interface ArraysByGeoUuid {
	X: ValueArrayByName;
	Y: ValueArrayByName;
	Z: ValueArrayByName;
	W: ValueArrayByName;
}
const _arraysByGeoUuid: ArraysByGeoUuid = {
	X: new Map(),
	Y: new Map(),
	Z: new Map(),
	W: new Map(),
};

export async function addVertexAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams
) {
	const coreObjects = coreGroup.threejsCoreObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (const coreObject of coreObjects) {
				await _addNumericAttributeToVertices(coreObject, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (const coreObject of coreObjects) {
				await _addStringAttributeToVertices(coreObject, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToVertices(coreObject: CoreObject, params: AttribCreateSopNodeParams) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	// const geometry = coreGeometry.geometry();
	// const primitivesCount = CorePrimitive.primitivesCount(geometry);

	const vertices = coreObject.verticesFromGroup(params.group.value);
	const attribName = CoreAttribute.remapName(params.name.value);
	const size = params.size.value;

	const param = [params.value1, params.value2, params.value3, params.value4][size - 1];

	if (param.hasExpression()) {
		const geometry = coreGeometry.geometry();
		let attribute = CoreVertex.attribute(geometry, attribName);
		if (!attribute) {
			const verticesCount = CoreVertex.verticesCount(geometry);
			const values = new Array(verticesCount * size).fill(0);
			attribute = new VertexNumberAttribute(values, size);
			CoreVertex.addAttribute(geometry, attribName, attribute);
		}

		// attribute.needsUpdate = true;
		const array = attribute.array as number[];
		if (size == 1) {
			const paramN = params.value1;
			if (paramN.expressionController) {
				if (paramN.expressionController.entitiesDependent()) {
					await paramN.expressionController.computeExpressionForVertices(
						vertices,
						(primitive, value: number) => {
							array[primitive.index() * size + 0] = value;
						}
					);
				} else {
					for (const vertex of vertices) {
						array[vertex.index() * size + 0] = paramN.value;
					}
				}
			}
		} else {
			const vparam = [params.value2, params.value3, params.value4][size - 2];
			const components = vparam.components;
			const tmpArrays = new Array(components.length);

			const arraysByGeometryUuid = [
				_arraysByGeoUuid.X,
				_arraysByGeoUuid.Y,
				_arraysByGeoUuid.Z,
				_arraysByGeoUuid.W,
			];

			for (let i = 0; i < components.length; i++) {
				const componentParam = components[i];
				if (componentParam.hasExpression() && componentParam.expressionController) {
					tmpArrays[i] = initArrayIfRequired(geometry, arraysByGeometryUuid[i], vertices.length);
					if (componentParam.expressionController.entitiesDependent()) {
						await componentParam.expressionController.computeExpressionForVertices(
							vertices,
							(point, value: number) => {
								// array[point.index()*this.pv.size+i] = value
								tmpArrays[i][point.index()] = value;
							}
						);
					} else {
						for (const vertex of vertices) {
							tmpArrays[i][vertex.index()] = componentParam.value;
						}
					}
				} else {
					const value = componentParam.value;
					for (let vertex of vertices) {
						array[vertex.index() * size + i] = value;
					}
				}
			}
			// commit the tmp values
			for (let j = 0; j < tmpArrays.length; j++) {
				const tmpArray = tmpArrays[j];
				if (tmpArray != null) {
					for (let i = 0; i < tmpArray.length; i++) {
						const newVal = tmpArray[i];
						if (newVal != null) {
							array[i * size + j] = newVal;
						}
					}
				}
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}

async function _addStringAttributeToVertices(coreObject: CoreObject, params: AttribCreateSopNodeParams) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	const vertices = coreObject.verticesFromGroup(params.group.value);
	const param = params.string;
	const attribName = params.name.value;

	if (param.hasExpression() && param.expressionController) {
		const geometry = coreGeometry.geometry();
		// if a group is given, we prefill the existing stringValues
		// create attrib if non existent
		const verticesCount = CoreVertex.verticesCount(geometry);
		const values = new Array(verticesCount).fill('');
		let attribute = CoreVertex.attribute(geometry, attribName);
		if (!attribute) {
			attribute = new VertexStringAttribute(values, 1);
			CoreVertex.addAttribute(geometry, attribName, attribute);
		}

		if (param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForVertices(vertices, (vertex, value) => {
				values[vertex.index()] = value;
			});
		} else {
			for (const vertex of vertices) {
				values[vertex.index()] = param.value;
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}
