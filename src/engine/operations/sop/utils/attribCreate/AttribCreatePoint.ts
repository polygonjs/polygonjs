import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreObject} from '../../../../../core/geometry/Object';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {hasGroupFromParamValues} from './Common';

export function addPointAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const coreObjects = coreGroup.threejsCoreObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (let coreObject of coreObjects) {
				_addNumericAttributeToPoints(coreObject, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (let coreObject of coreObjects) {
				_addStringAttributeToPoints(coreObject, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

function _addNumericAttributeToPoints(coreObject: CoreObject, params: AttribCreateSopParams) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];

	const attribName = CoreAttribute.remapName(params.name);
	if (!coreGeometry.hasAttrib(attribName)) {
		coreGeometry.addNumericAttrib(attribName, params.size, 0);
	} else {
		coreGeometry.markAttribAsNeedsUpdate(attribName);
	}

	if (params.group) {
		const points = coreObject.pointsFromGroup(params.group);
		for (let point of points) {
			point.setAttribValue(attribName, value);
		}
	} else {
		coreObject.addNumericPointAttrib(attribName, params.size, value);
	}
}

function _addStringAttributeToPoints(coreObject: CoreObject, params: AttribCreateSopParams) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	const points = coreObject.pointsFromGroup(params.group);
	const attribName = params.name;
	const value = params.string;

	let stringValues: string[] = new Array(points.length);

	// if a group is given, we prefill the existing stringValues
	if (hasGroupFromParamValues(params)) {
		const allPoints = coreObject.points();
		stringValues = stringValues.length != allPoints.length ? new Array(allPoints.length) : stringValues;
		// create attrib if non existent
		if (!coreGeometry.hasAttrib(attribName)) {
			const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
			coreGeometry.setIndexedAttribute(attribName, tmpIndexData['values'], tmpIndexData['indices']);
		}

		for (let point of allPoints) {
			let currentValue = point.stringAttribValue(attribName);
			if (currentValue == null) {
				currentValue = '';
			}
			stringValues[point.index()] = currentValue;
		}
	}

	for (let point of points) {
		stringValues[point.index()] = value;
	}

	const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);

	coreGeometry.setIndexedAttribute(attribName, indexData['values'], indexData['indices']);
}
