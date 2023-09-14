import {BufferAttribute} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {ValueArrayByObject, initArrayIfRequired} from './Common';
import {hasGroupFromParams, AttribCreateSopNodeParams} from '../../../../operations/sop/utils/attribCreate/Common';
import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {pointsFromObject, pointsFromObjectFromGroup} from '../../../../../core/geometry/entities/point/CorePointUtils';
import {corePointClassFactory} from '../../../../../core/geometry/CoreObjectFactory';
import {ObjectContent, CoreObjectType} from '../../../../../core/geometry/ObjectContent';
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
export async function addPointAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams
) {
	const objects = coreGroup.allObjects(); // filterObjectsFromCoreGroup(coreGroup, {group: params.group.value}); //coreGroup.allObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (const object of objects) {
				await _addNumericAttributeToPoints(object, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (const object of objects) {
				await _addStringAttributeToPoints(object, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToPoints<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopNodeParams
) {
	const corePointClass = corePointClassFactory(object);

	const points = pointsFromObjectFromGroup(object, params.group.value);
	const attribName = CoreAttribute.remapName(params.name.value);
	const size = params.size.value;

	const param = [params.value1, params.value2, params.value3, params.value4][size - 1];

	if (param.hasExpression()) {
		if (!corePointClass.hasAttribute(object, attribName)) {
			corePointClass.addNumericAttribute(object, attribName, size, param.value);
		}

		const attrib = corePointClass.attribute(object, attribName) as BufferAttribute;
		if (!attrib) {
			return;
		}
		attrib.needsUpdate = true;
		const array = attrib.array as number[];
		if (size == 1) {
			const paramN = params.value1;
			if (paramN.expressionController) {
				if (paramN.expressionController.entitiesDependent()) {
					await paramN.expressionController.computeExpressionForPoints(points, (point, value: number) => {
						array[point.index() * size + 0] = value;
					});
				} else {
					for (const point of points) {
						array[point.index() * size + 0] = paramN.value;
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
					tmpArrays[i] = initArrayIfRequired(object, arraysByGeometryUuid[i], points.length);
					if (componentParam.expressionController.entitiesDependent()) {
						await componentParam.expressionController.computeExpressionForPoints(
							points,
							(point, value: number) => {
								// array[point.index()*this.pv.size+i] = value
								tmpArrays[i][point.index()] = value;
							}
						);
					} else {
						for (const point of points) {
							tmpArrays[i][point.index()] = componentParam.value;
						}
					}
				} else {
					const value = componentParam.value;
					for (let point of points) {
						array[point.index() * size + i] = value;
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

async function _addStringAttributeToPoints<T extends CoreObjectType>(
	object: ObjectContent<T>,
	params: AttribCreateSopNodeParams
) {
	const corePointClass = corePointClassFactory(object);

	const points = pointsFromObjectFromGroup(object, params.group.value);
	const param = params.string;
	const attribName = params.name.value;

	let stringValues: string[] = new Array(points.length);
	if (param.hasExpression() && param.expressionController) {
		// if a group is given, we prefill the existing stringValues
		if (hasGroupFromParams(params)) {
			// create attrib if non existent

			if (!corePointClass.hasAttribute(object, attribName)) {
				const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
				corePointClass.setIndexedAttribute(object, attribName, tmpIndexData['values'], tmpIndexData['indices']);
			}
			const allPoints = pointsFromObject(object);
			stringValues = stringValues.length != allPoints.length ? new Array(allPoints.length) : stringValues;
			for (let point of allPoints) {
				let currentValue = point.stringAttribValue(attribName);
				if (currentValue == null) {
					currentValue = '';
				}
				stringValues[point.index()] = currentValue;
			}
		}
		if (param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForPoints(points, (point, value) => {
				stringValues[point.index()] = value;
			});
		} else {
			for (const point of points) {
				stringValues[point.index()] = param.value;
			}
		}
	} else {
		// no need to do work here, as this will be done in the operation
	}

	const indexData = CoreAttribute.arrayToIndexedArrays(stringValues);
	// const geometry = coreObject.coreGeometry();
	// if (geometry) {
	corePointClass.setIndexedAttribute(object, attribName, indexData['values'], indexData['indices']);
	// }
}
