import {attribValueNonPrimitive, copyAttribValue} from '../geometry/_BaseObjectUtils';
import {ObjectXD, _getObjectAttributeRef_} from './ObjectAttributeReactivity';
import type {Ref} from '@vue/reactivity';
import type {AttribValue} from '../../types/GlobalTypes';

function _copyObjectAttribToRef(attribValue: AttribValue, targetRef: Ref<AttribValue>) {
	if (attribValueNonPrimitive(attribValue) && attribValueNonPrimitive(targetRef.value)) {
		copyAttribValue(attribValue, targetRef.value);
	} else {
		targetRef.value = attribValue;
	}
}
export function _updateObjectAttribRef(object3D: ObjectXD, attribName: string, newValue: AttribValue) {
	const _ref = _getObjectAttributeRef_(object3D, attribName);
	if (!_ref) {
		return;
	}
	_copyObjectAttribToRef(_ref.current.value, _ref.previous);
	_copyObjectAttribToRef(newValue, _ref.current);
}
