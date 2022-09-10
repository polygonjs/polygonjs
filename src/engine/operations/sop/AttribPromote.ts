import {CorePoint} from './../../../core/geometry/Point';
import {CoreObject} from './../../../core/geometry/Object';
import {CoreAttribute} from './../../../core/geometry/Attribute';
import {AttribValue, NumericAttribValue} from './../../../types/GlobalTypes';
import {TypeAssert} from './../../poly/Assert';
import {CoreType} from './../../../core/Type';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';

import {ArrayUtils} from '../../../core/ArrayUtils';

import {DefaultOperationParams} from '../../../core/operations/_Base';
interface AttribPromoteSopParams extends DefaultOperationParams {
	classFrom: number;
	classTo: number;
	mode: number;
	name: string;
}

export enum AttribPromoteMode {
	MIN = 'min',
	MAX = 'max',
	FIRST_FOUND = 'first_round',
}
export const ATTRIB_PROMOTE_MODES: AttribPromoteMode[] = [
	AttribPromoteMode.MIN,
	AttribPromoteMode.MAX,
	AttribPromoteMode.FIRST_FOUND,
];

export class AttribPromoteSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribPromoteSopParams = {
		classFrom: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		classTo: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
		mode: ATTRIB_PROMOTE_MODES.indexOf(AttribPromoteMode.FIRST_FOUND),
		name: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribPromote'> {
		return 'attribPromote';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribPromoteSopParams) {
		const coreGroup = inputCoreGroups[0];

		const classFrom = ATTRIBUTE_CLASSES[params.classFrom];
		const classTo = ATTRIBUTE_CLASSES[params.classTo];

		const attribNames = _attribNames(coreGroup, classFrom, params.name);

		for (let attribName of attribNames) {
			promoteAttribute(coreGroup, classFrom, classTo, attribName, params);
		}

		return coreGroup;
	}
}

function _attribNames(coreGroup: CoreGroup, attribClass: AttribClass, mask: string) {
	switch (attribClass) {
		case AttribClass.VERTEX:
			return coreGroup.geoAttribNamesMatchingMask(mask);
		case AttribClass.OBJECT:
			return coreGroup.objectAttribNamesMatchingMask(mask);
		case AttribClass.CORE_GROUP:
			return coreGroup.attribNamesMatchingMask(mask);
	}
	TypeAssert.unreachable(attribClass);
}
function promoteAttribute(
	coreGroup: CoreGroup,
	classFrom: AttribClass,
	classTo: AttribClass,
	attribName: string,
	params: AttribPromoteSopParams
) {
	switch (classFrom) {
		case AttribClass.VERTEX:
			return promoteAttributeFromPoints(coreGroup, classTo, attribName, params);
		case AttribClass.OBJECT:
			return promoteAttributeFromObjects(coreGroup, classTo, attribName, params);
		case AttribClass.CORE_GROUP:
			return promoteAttributeFromCoreGroup(coreGroup, classTo, attribName);
	}
	TypeAssert.unreachable(classFrom);
}
function promoteAttributeFromPoints(
	coreGroup: CoreGroup,
	classTo: AttribClass,
	attribName: string,
	params: AttribPromoteSopParams
) {
	switch (classTo) {
		case AttribClass.VERTEX:
			return pointsToPoints(coreGroup, attribName, params);
		case AttribClass.OBJECT:
			return pointsToObject(coreGroup, attribName, params);
		case AttribClass.CORE_GROUP:
			return pointsToCoreGroup(coreGroup, attribName, params);
	}
	TypeAssert.unreachable(classTo);
}
function promoteAttributeFromObjects(
	coreGroup: CoreGroup,
	classTo: AttribClass,
	attribName: string,
	params: AttribPromoteSopParams
) {
	switch (classTo) {
		case AttribClass.VERTEX:
			return objectsToPoints(coreGroup, attribName);
		case AttribClass.OBJECT:
			return objectsToObjects(coreGroup, attribName, params);
		case AttribClass.CORE_GROUP:
			return objectsToCoreGroup(coreGroup, attribName, params);
	}
	TypeAssert.unreachable(classTo);
}
function promoteAttributeFromCoreGroup(coreGroup: CoreGroup, classTo: AttribClass, attribName: string) {
	switch (classTo) {
		case AttribClass.VERTEX:
			return coreGroupToPoints(coreGroup, attribName);
		case AttribClass.OBJECT:
			return coreGroupToObjects(coreGroup, attribName);
		case AttribClass.CORE_GROUP:
			// nothing can be promoted from group to group
			return;
	}
	TypeAssert.unreachable(classTo);
}
function pointsToPoints(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
	const values = findValuesFromPoints(coreGroup.points(), attribName);
	const value = filterValues(values, params);
	const coreObjects = coreGroup.coreObjects();
	for (let coreObject of coreObjects) {
		setValuesToPoints(coreObject, attribName, value as NumericAttribValue);
	}
}
function pointsToObject(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
	const coreObjects = coreGroup.coreObjects();
	for (let coreObject of coreObjects) {
		const values = findValuesFromPoints(coreObject.points(), attribName);
		const value = filterValues(values, params);
		coreObject.setAttribValue(attribName, value);
	}
}
function pointsToCoreGroup(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
	const values = findValuesFromPoints(coreGroup.points(), attribName);
	const value = filterValues(values, params);
	coreGroup.setAttribValue(attribName, value);
}
function objectsToPoints(coreGroup: CoreGroup, attribName: string) {
	const coreObjects = coreGroup.coreObjects();
	for (let coreObject of coreObjects) {
		const value = coreObject.attribValue(attribName);
		if (value == null) {
			return;
		}
		setValuesToPoints(coreObject, attribName, value as NumericAttribValue);
	}
}
function objectsToObjects(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
	const values = findValuesFromObjects(coreGroup, attribName);
	const value = filterValues(values, params);
	setValuesToObjects(coreGroup, attribName, value);
}
function objectsToCoreGroup(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
	const values = findValuesFromObjects(coreGroup, attribName);
	const value = filterValues(values, params);
	coreGroup.setAttribValue(attribName, value);
}
function coreGroupToPoints(coreGroup: CoreGroup, attribName: string) {
	const value = coreGroup.attribValue(attribName);
	if (value == null) {
		return;
	}
	const coreObjects = coreGroup.coreObjects();
	for (let coreObject of coreObjects) {
		setValuesToPoints(coreObject, attribName, value as NumericAttribValue);
	}
}
function coreGroupToObjects(coreGroup: CoreGroup, attribName: string) {
	const value = coreGroup.attribValue(attribName);
	if (value == null) {
		return;
	}
	setValuesToObjects(coreGroup, attribName, value);
}

function filterValues(values: number[], params: AttribPromoteSopParams) {
	const mode = ATTRIB_PROMOTE_MODES[params.mode];
	switch (mode) {
		case AttribPromoteMode.MIN: {
			return ArrayUtils.min(values);
		}
		case AttribPromoteMode.MAX: {
			return ArrayUtils.max(values);
		}
		case AttribPromoteMode.FIRST_FOUND: {
			return values[0];
		}
	}
	TypeAssert.unreachable(mode);
}

//
//
// VERTICES
//
//
function findValuesFromPoints(corePoints: CorePoint[], attribName: string) {
	const values: number[] = new Array(corePoints.length);
	const firstPoint = corePoints[0];
	if (firstPoint) {
		if (!firstPoint.isAttribIndexed(attribName)) {
			let point: CorePoint;
			for (let i = 0; i < corePoints.length; i++) {
				point = corePoints[i];
				values[i] = point.attribValue(attribName) as number;
			}
		}
	}
	return values;
}
function setValuesToPoints(coreObject: CoreObject, attribName: string, newValue: NumericAttribValue) {
	const attributeExists = coreObject.coreGeometry()?.hasAttrib(attribName);
	if (!attributeExists) {
		const attribSize = CoreAttribute.attribSizeFromValue(newValue);
		if (attribSize) {
			coreObject.addNumericVertexAttrib(attribName, attribSize, newValue);
		}
	}

	const points = coreObject.points();
	for (let point of points) {
		point.setAttribValue(attribName, newValue);
	}
}

//
//
// OBJECTS
//
//
function findValuesFromObjects(coreGroup: CoreGroup, attribName: string) {
	const values = coreGroup.coreObjects().map((coreObject: CoreObject) => coreObject.attribValue(attribName));

	const nonNullValues = ArrayUtils.compact(values);
	const numericValues = nonNullValues.filter((value) => CoreType.isNumber(value)) as number[];
	return numericValues;
}

function setValuesToObjects(coreGroup: CoreGroup, attribName: string, newValue: AttribValue) {
	const coreObjects = coreGroup.coreObjects();
	for (let coreObject of coreObjects) {
		coreObject.setAttribValue(attribName, newValue);
	}
}
