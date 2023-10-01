import {CoreGroup} from '../../../../../core/geometry/Group';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';

export function addCoreGroupAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	switch (attribType) {
		case AttribType.NUMERIC:
			_addNumericAttributeToCoreGroup(coreGroup, params);
			return;
		case AttribType.STRING:
			_addStringAttributeToCoreGroup(coreGroup, params);
			return;
	}
	TypeAssert.unreachable(attribType);
}

function _addNumericAttributeToCoreGroup(coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
	const attribName = params.name;
	coreGroup.setAttribValue(attribName, value);
}

function _addStringAttributeToCoreGroup(coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const value = params.string;
	coreGroup.setAttribValue(params.name, value);
}
