import {BufferAttribute} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreObject} from '../../../../../core/geometry/Object';
import {CoreAttribute} from '../../../../../core/geometry/Attribute';
import {ValueArrayByName, initArrayIfRequired} from './Common';
import {hasGroupFromParams, AttribCreateSopNodeParams} from '../../../../operations/sop/utils/attribCreate/Common';

import {AttribType} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';

interface ArraysByGeoUuid {
	X: ValueArrayByName;
	Y: ValueArrayByName;
	Z: ValueArrayByName;
	W: ValueArrayByName;
}
const _arraysByGeoUuid: ArraysByGeoUuid = {
	X: new Map(),
	Y: new Map(),
	Z: new Map(),
	W: new Map(),
};

export async function addPointAttribute(
	attribType: AttribType,
	coreGroup: CoreGroup,
	params: AttribCreateSopNodeParams
) {
	const coreObjects = coreGroup.threejsCoreObjects();
	switch (attribType) {
		case AttribType.NUMERIC: {
			for (const coreObject of coreObjects) {
				await _addNumericAttributeToPoints(coreObject, params);
			}
			return;
		}
		case AttribType.STRING: {
			for (const coreObject of coreObjects) {
				await _addStringAttributeToPoints(coreObject, params);
			}
			return;
		}
	}
	TypeAssert.unreachable(attribType);
}

async function _addNumericAttributeToPoints(coreObject: CoreObject, params: AttribCreateSopNodeParams) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	const points = coreObject.pointsFromGroup(params.group.value);
	const attribName = CoreAttribute.remapName(params.name.value);
	const size = params.size.value;

	const param = [params.value1, params.value2, params.value3, params.value4][size - 1];

	if (param.hasExpression()) {
		if (!coreGeometry.hasAttrib(attribName)) {
			coreGeometry.addNumericAttrib(attribName, size, param.value);
		}

		const geometry = coreGeometry.geometry();
		const attrib = geometry.getAttribute(attribName) as BufferAttribute;
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

			const arraysByGeometryUuid = [
				_arraysByGeoUuid.X,
				_arraysByGeoUuid.Y,
				_arraysByGeoUuid.Z,
				_arraysByGeoUuid.W,
			];

			for (let i = 0; i < components.length; i++) {
				const componentParam = components[i];
				if (componentParam.hasExpression() && componentParam.expressionController) {
					tmpArrays[i] = initArrayIfRequired(geometry, arraysByGeometryUuid[i], points.length);
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

async function _addStringAttributeToPoints(coreObject: CoreObject, params: AttribCreateSopNodeParams) {
	const coreGeometry = coreObject.coreGeometry();
	if (!coreGeometry) {
		return;
	}
	const points = coreObject.pointsFromGroup(params.group.value);
	const param = params.string;
	const attribName = params.name.value;

	let stringValues: string[] = new Array(points.length);
	if (param.hasExpression() && param.expressionController) {
		// if a group is given, we prefill the existing stringValues
		if (hasGroupFromParams(params)) {
			// create attrib if non existent

			if (!coreGeometry.hasAttrib(attribName)) {
				const tmpIndexData = CoreAttribute.arrayToIndexedArrays(['']);
				coreGeometry.setIndexedAttribute(attribName, tmpIndexData['values'], tmpIndexData['indices']);
			}
			const allPoints = coreObject.points();
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
	const geometry = coreObject.coreGeometry();
	if (geometry) {
		geometry.setIndexedAttribute(attribName, indexData['values'], indexData['indices']);
	}
}
