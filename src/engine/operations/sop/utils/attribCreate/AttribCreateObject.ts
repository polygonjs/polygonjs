import {CoreGroup} from '../../../../../core/geometry/Group';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {CoreMask} from '../../../../../core/geometry/Mask';
import {BaseCoreObject} from '../../../../../core/geometry/entities/object/BaseCoreObject';
import {CoreObjectType} from '../../../../../core/geometry/ObjectContent';
import {defaultAttribValue} from './Common';

export function addObjectAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const coreObjects = CoreMask.filterCoreObjects(coreGroup, params, coreGroup.allCoreObjects());

	// add attrib if non existent
	const attribName = params.name;
	const allCoreObjects = coreGroup.allCoreObjects();
	const defaultValue = defaultAttribValue(params);
	if (defaultValue != null) {
		for (let coreObject of allCoreObjects) {
			if (!coreObject.hasAttrib(attribName)) {
				coreObject.setAttribValue(attribName, defaultValue);
			}
		}
	}

	switch (attribType) {
		case AttribType.NUMERIC:
			_addNumericAttributeToObjects(coreObjects, params);
			return;
		case AttribType.STRING:
			_addStringAttributeToObjects(coreObjects, params);
			return;
	}
	TypeAssert.unreachable(attribType);
}

function _addNumericAttributeToObjects<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[],
	params: AttribCreateSopParams
) {
	const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];
	const attribName = params.name;
	for (let coreObject of coreObjects) {
		coreObject.setAttribValue(attribName, value);
	}
}

function _addStringAttributeToObjects<T extends CoreObjectType>(
	coreObjects: BaseCoreObject<T>[],
	params: AttribCreateSopParams
) {
	const value = params.string;
	for (let coreObject of coreObjects) {
		coreObject.setAttribValue(params.name, value);
	}
}
