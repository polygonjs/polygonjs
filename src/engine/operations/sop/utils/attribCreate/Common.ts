import {Vector2, Vector3, Vector4} from 'three';
import type {IntegerParam} from '../../../../params/Integer';
import type {FloatParam} from '../../../../params/Float';
import type {StringParam} from '../../../../params/String';
import type {Vector2Param} from '../../../../params/Vector2';
import type {Vector3Param} from '../../../../params/Vector3';
import type {Vector4Param} from '../../../../params/Vector4';
import type {AttribCreateSopParams} from '../../AttribCreate';
import {TypeAssert} from '../../../../poly/Assert';
import {ATTRIBUTE_TYPES, AttribType} from '../../../../../core/geometry/Constant';

export interface AttribCreateSopNodeParams {
	group: StringParam;
	name: StringParam;
	size: IntegerParam;
	value1: FloatParam;
	value2: Vector2Param;
	value3: Vector3Param;
	value4: Vector4Param;
	string: StringParam;
}

export function hasGroupFromParams(params: AttribCreateSopNodeParams) {
	return params.group.value.trim() != '';
}
export function hasGroupFromParamValues(params: AttribCreateSopParams) {
	return params.group.trim() != '';
}

export function _attribType(params: AttribCreateSopParams) {
	return ATTRIBUTE_TYPES[params.type];
}

export function defaultAttribValue(params: AttribCreateSopParams) {
	const attribType = _attribType(params);
	switch (attribType) {
		case AttribType.NUMERIC: {
			return _defaultNumericValue(params);
		}
		case AttribType.STRING: {
			return _defaultStringValue();
		}
	}
	TypeAssert.unreachable(attribType);
}
export function _defaultStringValue() {
	return '';
}
export function _defaultNumericValue(params: AttribCreateSopParams) {
	const size = params.size;
	switch (size) {
		case 1:
			return 0;
		case 2:
			return new Vector2(0, 0);
		case 3:
			return new Vector3(0, 0, 0);
		case 4:
			return new Vector4(0, 0, 0, 0);
	}
}
