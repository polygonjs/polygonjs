// import {CorePoint} from './../../../core/geometry/entities/point/CorePoint';
// import {CoreAttribute} from './../../../core/geometry/Attribute';
// import {AttribValue, NumericAttribValue} from './../../../types/GlobalTypes';
// import {TypeAssert} from './../../poly/Assert';
// import {CoreType} from './../../../core/Type';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
// import {ArrayUtils} from '../../../core/ArrayUtils';
import {DefaultOperationParams} from '../../../core/operations/_Base';
// import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {coreObjectInstanceFactory} from '../../../core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';
// import { CoreEntity } from '../../../core/geometry/CoreEntity';
interface AttribPromoteSopParams extends DefaultOperationParams {
	group: string;
	classFrom: number;
	classTo: number;
	mode: number;
	name: string;
}

export enum AttribPromoteMode {
	MIN = 'min',
	MAX = 'max',
	FIRST_FOUND = 'first found',
}
export const ATTRIB_PROMOTE_MODES: AttribPromoteMode[] = [
	AttribPromoteMode.MIN,
	AttribPromoteMode.MAX,
	AttribPromoteMode.FIRST_FOUND,
];

export class AttribPromoteSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribPromoteSopParams = {
		group: '',
		classFrom: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
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

		const objects = filterObjectsFromCoreGroup(coreGroup, params);
		for (const object of objects) {
			// const coreObjectClass = coreObjectClassFactory(object);
			// const attribNames = coreObjectClass.attributeNamesMatchingMask(object, params.name);
			// for (const attribName of attribNames) {
			this._promoteAttribute(coreGroup, object, classFrom, classTo, params);
			// }
		}

		// const attribNames = _attribNames(coreGroup, classFrom, params.name);

		// for (let attribName of attribNames) {
		// 	promoteAttribute(coreGroup, classFrom, classTo, attribName, params);
		// }

		return coreGroup;
	}

	private _promoteAttribute<T extends CoreObjectType>(
		coreGroup: CoreGroup,
		object: ObjectContent<T>,
		// attribName: string,
		classFrom: AttribClass,
		classTo: AttribClass,
		params: AttribPromoteSopParams
	) {
		const destEntities = coreObjectInstanceFactory(object).relatedEntities(classTo);
		for (const destEntity of destEntities) {
			const srcEntities = destEntity.relatedEntities(classFrom);
			console.log({srcEntities, destEntity});
		}
	}
	// private _destEntities<T extends CoreObjectType>(coreGroup:CoreGroup, object:ObjectContent<T>, classTo: AttribClass){
	// 	switch(classTo){
	// 		case AttribClass.POINT:{
	// 			return coreObjectInstanceFactory(object).relatedPoints()
	// 		}
	// 		case AttribClass.VERTEX:{
	// 			return coreObjectInstanceFactory(object).relatedVertices()
	// 		}
	// 		case AttribClass.PRIMITIVE:{
	// 				return coreObjectInstanceFactory(object).relatedPrimitives()
	// 		}
	// 		case AttribClass.OBJECT:{
	// 			return [object]
	// 		}
	// 		case AttribClass.CORE_GROUP:{
	// 			return [coreGroup]
	// 		}
	// 	}
	// }
	// private _srcEntities<T extends CoreObjectType>(coreGroup:CoreGroup, entity:CoreEntity, classFrom: AttribClass){
	// 	switch(classFrom){
	// 		case AttribClass.POINT:{
	// 			return entity.related()
	// 		}
	// 		case AttribClass.VERTEX:{
	// 			return entity.relatedVertices()
	// 		}
	// 		case AttribClass.PRIMITIVE:{
	// 				return entity.relatedVertices()
	// 		}
	// 		case AttribClass.OBJECT:{
	// 			return [object]
	// 		}
	// 		case AttribClass.CORE_GROUP:{
	// 			return [coreGroup]
	// 		}
	// 	}
	// }
}

// function _attribNames(coreGroup: CoreGroup, attribClass: AttribClass, mask: string): string[] {
// 	switch (attribClass) {
// 		case AttribClass.POINT:
// 			return coreGroup.pointAttribNamesMatchingMask(mask);
// 		case AttribClass.VERTEX: {
// 			console.warn('primitive not supported yet');
// 			return [];
// 		}
// 		case AttribClass.PRIMITIVE: {
// 			console.warn('primitive not supported yet');
// 			return [];
// 		}
// 		case AttribClass.OBJECT:
// 			return coreGroup.objectAttribNamesMatchingMask(mask);
// 		case AttribClass.CORE_GROUP:
// 			return coreGroup.attribNamesMatchingMask(mask);
// 	}
// 	TypeAssert.unreachable(attribClass);
// }
// function promoteAttribute(
// 	coreGroup: CoreGroup,
// 	classFrom: AttribClass,
// 	classTo: AttribClass,
// 	attribName: string,
// 	params: AttribPromoteSopParams
// ) {
// 	switch (classFrom) {
// 		case AttribClass.POINT:
// 			return promoteAttributeFromPoints(coreGroup, classTo, attribName, params);
// 		case AttribClass.VERTEX: {
// 			console.warn('vertex not supported yet');
// 			return;
// 		}
// 		case AttribClass.PRIMITIVE: {
// 			console.warn('primitive not supported yet');
// 			return;
// 		}
// 		case AttribClass.OBJECT:
// 			return promoteAttributeFromObjects(coreGroup, classTo, attribName, params);
// 		case AttribClass.CORE_GROUP:
// 			return promoteAttributeFromCoreGroup(coreGroup, classTo, attribName);
// 	}
// 	TypeAssert.unreachable(classFrom);
// }
// function promoteAttributeFromPoints(
// 	coreGroup: CoreGroup,
// 	classTo: AttribClass,
// 	attribName: string,
// 	params: AttribPromoteSopParams
// ) {
// 	switch (classTo) {
// 		case AttribClass.POINT:
// 			return pointsToPoints(coreGroup, attribName, params);
// 		case AttribClass.VERTEX: {
// 			console.warn('vertex not supported yet');
// 			return;
// 		}
// 		case AttribClass.PRIMITIVE: {
// 			console.warn('primitive not supported yet');
// 			return;
// 		}
// 		case AttribClass.OBJECT:
// 			return pointsToObject(coreGroup, attribName, params);
// 		case AttribClass.CORE_GROUP:
// 			return pointsToCoreGroup(coreGroup, attribName, params);
// 	}
// 	TypeAssert.unreachable(classTo);
// }
// function promoteAttributeFromObjects(
// 	coreGroup: CoreGroup,
// 	classTo: AttribClass,
// 	attribName: string,
// 	params: AttribPromoteSopParams
// ) {
// 	switch (classTo) {
// 		case AttribClass.POINT:
// 			return objectsToPoints(coreGroup, attribName);
// 		case AttribClass.VERTEX: {
// 			console.warn('primitive not supported yet');
// 			return;
// 		}
// 		case AttribClass.PRIMITIVE: {
// 			console.warn('primitive not supported yet');
// 			return;
// 		}
// 		case AttribClass.OBJECT:
// 			return objectsToObjects(coreGroup, attribName, params);
// 		case AttribClass.CORE_GROUP:
// 			return objectsToCoreGroup(coreGroup, attribName, params);
// 	}
// 	TypeAssert.unreachable(classTo);
// }
// function promoteAttributeFromCoreGroup(coreGroup: CoreGroup, classTo: AttribClass, attribName: string) {
// 	switch (classTo) {
// 		case AttribClass.POINT:
// 			return coreGroupToPoints(coreGroup, attribName);
// 		case AttribClass.VERTEX: {
// 			console.log('vertex not supported yet');
// 			return;
// 		}
// 		case AttribClass.PRIMITIVE: {
// 			console.log('primitive not supported yet');
// 			return;
// 		}

// 		case AttribClass.OBJECT:
// 			return coreGroupToObjects(coreGroup, attribName);
// 		case AttribClass.CORE_GROUP:
// 			// nothing can be promoted from group to group
// 			return;
// 	}
// 	TypeAssert.unreachable(classTo);
// }
// function pointsToPoints(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
// 	const values = findValuesFromPoints(coreGroup.points(), attribName);
// 	const value = filterValues(values, params);
// 	const objects = coreGroup.allObjects();
// 	for (let object of objects) {
// 		setValuesToPoints(object, attribName, value as NumericAttribValue);
// 	}
// }
// function pointsToObject(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
// 	const coreObjects = coreGroup.allCoreObjects();
// 	for (let coreObject of coreObjects) {
// 		const object = coreObject.object();
// 		const points = pointsFromObject(object);
// 		const values = findValuesFromPoints(points, attribName);
// 		const value = filterValues(values, params);
// 		coreObject.setAttribValue(attribName, value);
// 	}
// }
// function pointsToCoreGroup(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
// 	const values = findValuesFromPoints(coreGroup.points(), attribName);
// 	const value = filterValues(values, params);
// 	coreGroup.setAttribValue(attribName, value);
// }
// function objectsToPoints(coreGroup: CoreGroup, attribName: string) {
// 	const objects = coreGroup.allObjects();
// 	for (let object of objects) {
// 		const coreObjectClass = coreObjectClassFactory(object);
// 		const value = coreObjectClass.attribValue(object, attribName);
// 		if (value == null) {
// 			return;
// 		}
// 		setValuesToPoints(object, attribName, value as NumericAttribValue);
// 	}
// }
// function objectsToObjects(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
// 	const values = findValuesFromObjects(coreGroup, attribName);
// 	const value = filterValues(values, params);
// 	setValuesToObjects(coreGroup, attribName, value);
// }
// function objectsToCoreGroup(coreGroup: CoreGroup, attribName: string, params: AttribPromoteSopParams) {
// 	const values = findValuesFromObjects(coreGroup, attribName);
// 	const value = filterValues(values, params);
// 	coreGroup.setAttribValue(attribName, value);
// }
// function coreGroupToPoints(coreGroup: CoreGroup, attribName: string) {
// 	const value = coreGroup.attribValue(attribName);
// 	if (value == null) {
// 		return;
// 	}
// 	const objects = coreGroup.allObjects();
// 	for (let object of objects) {
// 		setValuesToPoints(object, attribName, value as NumericAttribValue);
// 	}
// }
// function coreGroupToObjects(coreGroup: CoreGroup, attribName: string) {
// 	const value = coreGroup.attribValue(attribName);
// 	if (value == null) {
// 		return;
// 	}
// 	setValuesToObjects(coreGroup, attribName, value);
// }

// function filterValues(values: number[], params: AttribPromoteSopParams) {
// 	const mode = ATTRIB_PROMOTE_MODES[params.mode];
// 	switch (mode) {
// 		case AttribPromoteMode.MIN: {
// 			return ArrayUtils.min(values);
// 		}
// 		case AttribPromoteMode.MAX: {
// 			return ArrayUtils.max(values);
// 		}
// 		case AttribPromoteMode.FIRST_FOUND: {
// 			return values[0];
// 		}
// 	}
// 	TypeAssert.unreachable(mode);
// }

// //
// //
// // POINTS
// //
// //
// function findValuesFromPoints(corePoints: CorePoint[], attribName: string) {
// 	const values: number[] = new Array(corePoints.length);
// 	const firstPoint = corePoints[0];
// 	if (firstPoint) {
// 		if (!firstPoint.isAttribIndexed(attribName)) {
// 			let point: CorePoint;
// 			for (let i = 0; i < corePoints.length; i++) {
// 				point = corePoints[i];
// 				values[i] = point.attribValue(attribName) as number;
// 			}
// 		}
// 	}
// 	return values;
// }
// function setValuesToPoints<T extends CoreObjectType>(
// 	object: ObjectContent<T>,
// 	attribName: string,
// 	newValue: NumericAttribValue
// ) {
// 	const corePointClass = corePointClassFactory(object);
// 	const attributeExists = corePointClass.hasAttribute(object, attribName);
// 	if (!attributeExists) {
// 		const attribSize = CoreAttribute.attribSizeFromValue(newValue);
// 		if (attribSize) {
// 			const corePointClass = corePointClassFactory(object);
// 			corePointClass.addNumericAttribute(object, attribName, attribSize, newValue);
// 		}
// 	}

// 	const points = pointsFromObject(object);
// 	for (let point of points) {
// 		point.setAttribValue(attribName, newValue);
// 	}
// }

// //
// //
// // OBJECTS
// //
// //
// function findValuesFromObjects(coreGroup: CoreGroup, attribName: string) {
// 	const values = coreGroup.allCoreObjects().map((coreObject) => coreObject.attribValue(attribName));

// 	const nonNullValues = ArrayUtils.compact(values);
// 	const numericValues = nonNullValues.filter((value) => CoreType.isNumber(value)) as number[];
// 	return numericValues;
// }

// function setValuesToObjects(coreGroup: CoreGroup, attribName: string, newValue: AttribValue) {
// 	const coreObjects = coreGroup.allCoreObjects();
// 	for (let coreObject of coreObjects) {
// 		coreObject.setAttribValue(attribName, newValue);
// 	}
// }
