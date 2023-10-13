import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {AttribCreateSopParams} from '../../AttribCreate';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {hasGroupFromParamValues} from './Common';
import {corePointClassFactory} from '../../../../../core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../../../core/geometry/ObjectContent';
import {pointsFromObject, pointsFromObjectFromGroup} from '../../../../../core/geometry/entities/point/CorePointUtils';
import {CorePoint} from '../../../../../core/geometry/entities/point/CorePoint';

export function addPointAttribute(attribType: AttribType, coreGroup: CoreGroup, params: AttribCreateSopParams) {
	const objects = coreGroup.allObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (let object of objects) {
				_addNumericAttributeToPoints(object, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (let object of objects) {
				_addStringAttributeToPoints(object, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

const _points: CorePoint<CoreObjectType>[] = [];
const _allPoints: CorePoint<CoreObjectType>[] = [];
function _addNumericAttributeToPoints<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopParams
) {
	const corePointClass = corePointClassFactory(object);

	// const coreGeometry = coreObject.coreGeometry();
	// if (!coreGeometry) {
	// 	return;
	// }
	const value = [params.value1, params.value2, params.value3, params.value4][params.size - 1];

	const attribName = CoreAttribute.remapName(params.name);
	if (!corePointClass.hasAttribute(object, attribName)) {
		corePointClass.addNumericAttribute(object, attribName, params.size, 0);
	} else {
		corePointClass.markAttribAsNeedsUpdate(object, attribName);
	}

	if (params.group) {
		pointsFromObjectFromGroup(object, params.group, _points);
		for (let point of _points) {
			point.setAttribValue(attribName, value);
		}
	} else {
		corePointClass.addNumericAttribute(object, attribName, params.size, value);
	}
}

function _addStringAttributeToPoints<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopParams
) {
	const corePointClass = corePointClassFactory(object);
	// const coreGeometry = coreObject.coreGeometry();
	// if (!coreGeometry) {
	// 	return;
	// }
	pointsFromObjectFromGroup(object, params.group, _points);
	const attribName = params.name;
	const value = params.string;

	let stringValues: string[] = new Array(_points.length);

	// if a group is given, we prefill the existing stringValues
	if (hasGroupFromParamValues(params)) {
		pointsFromObject(object, _allPoints);
		stringValues = stringValues.length != _allPoints.length ? new Array(_allPoints.length) : stringValues;
		// create attrib if non existent
		if (!corePointClass.hasAttribute(object, attribName)) {
			const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
			corePointClass.setIndexedAttribute(object, attribName, tmpIndexData['values'], tmpIndexData['indices']);
		}

		for (const point of _allPoints) {
			let currentValue = point.stringAttribValue(attribName);
			if (currentValue == null) {
				currentValue = '';
			}
			stringValues[point.index()] = currentValue;
		}
	}

	for (const point of _points) {
		stringValues[point.index()] = value;
	}

	const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);

	corePointClass.setIndexedAttribute(object, attribName, indexData['values'], indexData['indices']);
}
