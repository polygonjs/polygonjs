import {Vector2, Vector3, Vector4} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {COMPONENT_NAMES, vectorByAttribSize} from './Common';
import {AttribCreateSopParams} from '../../../../operations/sop/AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {AttribCreateSopNodeParams} from '../../../../operations/sop/utils/attribCreate/Common';

export async function addCoreGroupAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams,
	pv: AttribCreateSopParams
) {
	switch (attribType) {
		case AttribType.NUMERIC:
			await _addNumericAttributeToCoreGroup(coreGroup, params, pv);
			return;
		case AttribType.STRING:
			await _addStringAttributeToCoreGroup(coreGroup, params, pv);
			return;
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToCoreGroup(
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams,
	pv: AttribCreateSopParams
) {
	const param = [params.value1, params.value2, params.value3, params.value4][pv.size - 1];
	const attribName = pv.name;
	if (param.hasExpression()) {
		if (pv.size == 1) {
			if (param.expressionController) {
				if (param.expressionController.entitiesDependent()) {
					await param.expressionController.computeExpressionForCoreGroup(coreGroup, (coreGroup, value) => {
						coreGroup.setAttribValue(attribName, value);
					});
				} else {
					coreGroup.setAttribValue(attribName, param.value);
				}
			}
		} else {
			const vparam = [params.value2, params.value3, params.value4][pv.size - 2];
			let components = vparam.components;
			let valuesByCoreObjectIndex: Map<number, Vector2 | Vector3 | Vector4> = new Map();
			// for (let component_param of params) {
			// 	values.push(component_param.value);
			// }
			const initVector = vectorByAttribSize(pv.size);
			if (initVector) {
				// for (let coreObject of coreObjects) {
				valuesByCoreObjectIndex.set(coreGroup.index(), initVector.clone());
				// }
				for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
					const component_param = components[componentIndex];
					const component_name = COMPONENT_NAMES[componentIndex];
					if (
						component_param.hasExpression() &&
						component_param.expressionController &&
						component_param.expressionController.entitiesDependent()
					) {
						await component_param.expressionController.computeExpressionForCoreGroup(
							coreGroup,
							(coreGroup, value) => {
								const vector = valuesByCoreObjectIndex.get(coreGroup.index()) as Vector4;
								vector[component_name] = value;
							}
						);
					} else {
						// for (let coreObject of coreObjects) {
						const vector = valuesByCoreObjectIndex.get(coreGroup.index()) as Vector4;
						vector[component_name] = component_param.value;
						// }
					}
				}
				// for (let i = 0; i < coreObjects.length; i++) {
				// const coreObject = coreObjects[i];
				const value = valuesByCoreObjectIndex.get(coreGroup.index());
				if (value != null) {
					coreGroup.setAttribValue(attribName, value);
				}
				// }
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}

async function _addStringAttributeToCoreGroup(
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams,
	pv: AttribCreateSopParams
) {
	const param = params.string;
	const attribName = pv.name;
	if (param.hasExpression() && param.expressionController) {
		if (param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForCoreGroup(coreGroup, (coreGroup, value) => {
				coreGroup.setAttribValue(attribName, value);
			});
		} else {
			coreGroup.setAttribValue(attribName, param.value);
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}
}
