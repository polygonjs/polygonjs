import {Vector2, Vector3, Vector4} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {COMPONENT_NAMES, vectorByAttribSize} from './Common';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {CoreMask} from '../../../../../core/geometry/Mask';
import {AttribCreateSopParams} from '../../../../operations/sop/AttribCreate';
import {CoreObjectType} from '../../../../../core/geometry/ObjectContent';
import {BaseCoreObject} from '../../../../../core/geometry/entities/object/BaseCoreObject';
import {AttribCreateSopNodeParams, defaultAttribValue} from '../../../../operations/sop/utils/attribCreate/Common';

export async function addObjectAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams,
	pv: AttribCreateSopParams
) {
	const coreObjects = CoreMask.filterCoreObjects(coreGroup, pv, coreGroup.allCoreObjects());

	// add attrib if non existent
	const attribName = pv.name;
	const allCoreObjects = coreGroup.allCoreObjects();
	const defaultValue = defaultAttribValue(pv);
	if (defaultValue != null) {
		for (const coreObject of allCoreObjects) {
			if (!coreObject.hasAttribute(attribName)) {
				coreObject.setAttribValue(attribName, defaultValue);
			}
		}
	}

	switch (attribType) {
		case AttribType.NUMERIC:
			await _addNumericAttributeToObject(coreObjects, params, pv);
			return;
		case AttribType.STRING:
			await _addStringAttributeToObject(coreObjects, params, pv);
			return;
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToObject<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[],
	params: AttribCreateSopNodeParams,
	pv: AttribCreateSopParams
) {
	const param = [params.value1, params.value2, params.value3, params.value4][pv.size - 1];
	const attribName = pv.name;
	if (param.hasExpression()) {
		if (pv.size == 1) {
			if (param.expressionController) {
				if (param.expressionController?.entitiesDependent()) {
					await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
						coreObject.setAttribValue(attribName, value);
					});
				} else {
					for (const coreObject of coreObjects) {
						coreObject.setAttribValue(attribName, param.value);
					}
				}
			}
		} else {
			const vparam = [params.value2, params.value3, params.value4][pv.size - 2];
			const components = vparam.components;
			const valuesByCoreObjectIndex: Map<number, Vector2 | Vector3 | Vector4> = new Map();
			// for (let component_param of params) {
			// 	values.push(component_param.value);
			// }
			const initVector = vectorByAttribSize(pv.size);
			if (initVector) {
				for (const coreObject of coreObjects) {
					valuesByCoreObjectIndex.set(coreObject.index(), initVector.clone());
				}
				for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
					const component_param = components[componentIndex];
					const component_name = COMPONENT_NAMES[componentIndex];
					if (
						component_param.hasExpression() &&
						component_param.expressionController &&
						component_param.expressionController.entitiesDependent()
					) {
						await component_param.expressionController.computeExpressionForObjects(
							coreObjects,
							(coreObject, value) => {
								const vector = valuesByCoreObjectIndex.get(coreObject.index()) as Vector4;
								vector[component_name] = value;
							}
						);
					} else {
						for (const coreObject of coreObjects) {
							const vector = valuesByCoreObjectIndex.get(coreObject.index()) as Vector4;
							vector[component_name] = component_param.value;
						}
					}
				}
				for (let i = 0; i < coreObjects.length; i++) {
					const coreObject = coreObjects[i];
					const value = valuesByCoreObjectIndex.get(coreObject.index());
					if (value != null) {
						coreObject.setAttribValue(attribName, value);
					}
				}
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}

async function _addStringAttributeToObject<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[],
	params: AttribCreateSopNodeParams,
	pv: AttribCreateSopParams
) {
	const param = params.string;
	const attribName = pv.name;
	if (param.hasExpression() && param.expressionController) {
		if (param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
				coreObject.setAttribValue(attribName, value);
			});
		} else {
			for (const coreObject of coreObjects) {
				coreObject.setAttribValue(attribName, param.value);
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}
