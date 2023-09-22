import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {ValueArrayByObject, initArrayIfRequired} from './Common';
import {AttribCreateSopNodeParams} from '../../../../operations/sop/utils/attribCreate/Common';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {verticesFromObjectFromGroup} from '../../../../../core/geometry/entities/vertex/CoreVertexUtils';
import {coreVertexClassFactory} from '../../../../../core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../../core/geometry/ObjectContent';
// import {filterObjectsFromCoreGroup} from '../../../../../core/geometry/Mask';

interface ArraysByObject {
	X: ValueArrayByObject;
	Y: ValueArrayByObject;
	Z: ValueArrayByObject;
	W: ValueArrayByObject;
}
const _arraysByObject: ArraysByObject = {
	X: new WeakMap(),
	Y: new WeakMap(),
	Z: new WeakMap(),
	W: new WeakMap(),
};
const arraysByGeometryUuid = [_arraysByObject.X, _arraysByObject.Y, _arraysByObject.Z, _arraysByObject.W];

export async function addVertexAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams
) {
	const objects = coreGroup.allObjects(); //filterObjectsFromCoreGroup(coreGroup, {group: params.group.value});
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (const object of objects) {
				await _addNumericAttributeToVertices(object, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (const object of objects) {
				await _addStringAttributeToVertices(object, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToVertices<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopNodeParams
) {
	const vertices = verticesFromObjectFromGroup(object, params.group.value);
	const attribName = CoreAttribute.remapName(params.name.value);
	const size = params.size.value;

	const param = [params.value1, params.value2, params.value3, params.value4][size - 1];

	if (param.hasExpression()) {
		const vertexClass = coreVertexClassFactory(object);
		let attribute = vertexClass.attribute(object, attribName);
		if (!attribute) {
			const verticesCount = vertexClass.verticesCount(object);
			const values = new Array(verticesCount * size).fill(0);
			attribute = {array: values, itemSize: size, isString: false};
			vertexClass.addAttribute(object, attribName, attribute);
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

			for (let i = 0; i < components.length; i++) {
				const componentParam = components[i];
				if (componentParam.hasExpression() && componentParam.expressionController) {
					tmpArrays[i] = initArrayIfRequired(object, arraysByGeometryUuid[i], vertices.length);
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
					for (const vertex of vertices) {
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

async function _addStringAttributeToVertices<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopNodeParams
) {
	const vertices = verticesFromObjectFromGroup(object, params.group.value);
	const param = params.string;
	const attribName = params.name.value;

	if (param.hasExpression() && param.expressionController) {
		// if a group is given, we prefill the existing stringValues
		// create attrib if non existent
		const vertexClass = coreVertexClassFactory(object);
		const verticesCount = vertexClass.verticesCount(object);
		const values = new Array(verticesCount).fill('');
		let attribute = vertexClass.attribute(object, attribName);
		if (!attribute) {
			attribute = {array: values, itemSize: 1, isString: true};
			vertexClass.addAttribute(object, attribName, attribute);
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
