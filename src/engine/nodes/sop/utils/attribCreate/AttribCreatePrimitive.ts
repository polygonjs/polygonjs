import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {ValueArrayByObject, initArrayIfRequired} from './Common';
import {AttribCreateSopNodeParams} from '../../../../operations/sop/utils/attribCreate/Common';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {primitivesFromObjectFromGroup} from '../../../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {corePrimitiveClassFactory} from '../../../../../core/geometry/CoreObjectFactory';
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

export async function addPrimitiveAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams
) {
	const objects = coreGroup.allObjects(); //filterObjectsFromCoreGroup(coreGroup, {group: params.group.value});
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (const object of objects) {
				await _addNumericAttributeToPrimitives(object, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (const object of objects) {
				await _addStringAttributeToPrimitives(object, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToPrimitives<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopNodeParams
) {
	const primitives = primitivesFromObjectFromGroup(object, params.group.value);
	const attribName = CoreAttribute.remapName(params.name.value);
	const size = params.size.value;

	const param = [params.value1, params.value2, params.value3, params.value4][size - 1];

	if (param.hasExpression()) {
		const primitiveClass = corePrimitiveClassFactory(object);
		let attribute = primitiveClass.attribute(object, attribName);
		if (!attribute) {
			const primitivesCount = primitiveClass.primitivesCount(object);
			const values = new Array(primitivesCount * size).fill(0);
			attribute = {
				array: values,
				itemSize: size,
				isString: false,
			};
			primitiveClass.addAttribute(object, attribName, attribute);
		}

		// attribute.needsUpdate = true;
		const array = attribute.array as number[];
		if (size == 1) {
			const paramN = params.value1;
			if (paramN.expressionController) {
				if (paramN.expressionController.entitiesDependent()) {
					await paramN.expressionController.computeExpressionForPrimitives(
						primitives,
						(primitive, value: number) => {
							array[primitive.index() * size + 0] = value;
						}
					);
				} else {
					for (const primitive of primitives) {
						array[primitive.index() * size + 0] = paramN.value;
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
					tmpArrays[i] = initArrayIfRequired(object, arraysByGeometryUuid[i], primitives.length);
					if (componentParam.expressionController.entitiesDependent()) {
						await componentParam.expressionController.computeExpressionForPrimitives(
							primitives,
							(point, value: number) => {
								// array[point.index()*this.pv.size+i] = value
								tmpArrays[i][point.index()] = value;
							}
						);
					} else {
						for (const primitive of primitives) {
							tmpArrays[i][primitive.index()] = componentParam.value;
						}
					}
				} else {
					const value = componentParam.value;
					for (let primitive of primitives) {
						array[primitive.index() * size + i] = value;
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

async function _addStringAttributeToPrimitives<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopNodeParams
) {
	const primitives = primitivesFromObjectFromGroup(object, params.group.value);
	const param = params.string;
	const attribName = params.name.value;

	if (param.hasExpression() && param.expressionController) {
		// if a group is given, we prefill the existing stringValues
		// create attrib if non existent
		const primitiveClass = corePrimitiveClassFactory(object);
		const primitivesCount = primitiveClass.primitivesCount(object);
		const values = new Array(primitivesCount).fill('');
		let attribute = primitiveClass.attribute(object, attribName);
		if (!attribute) {
			attribute = {array: values, itemSize: 1, isString: true};
			primitiveClass.addAttribute(object, attribName, attribute);
		}

		if (param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForPrimitives(primitives, (primitive, value) => {
				values[primitive.index()] = value;
			});
		} else {
			for (const primitive of primitives) {
				values[primitive.index()] = param.value;
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}
