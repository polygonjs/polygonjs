import {AttribValue} from '../../types/GlobalTypes';
// import {touchObjectAttribute} from './GetObjectAttribute';
import {_getObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivity';
import {NamedFunction2} from './_Base';
import {attribValueNonPrimitive, copyAttribValue} from '../../core/geometry/_BaseObject';
import {Ref} from '@vue/reactivity';

export function _copyToRef(attribValue: AttribValue, targetRef: Ref<AttribValue>) {
	if (attribValueNonPrimitive(attribValue) && attribValueNonPrimitive(targetRef.value)) {
		copyAttribValue(attribValue, targetRef.value);
	} else {
		targetRef.value = attribValue;
	}
}

export class setObjectAttributeRef extends NamedFunction2<[AttribValue, Ref<AttribValue>]> {
	static override type() {
		return 'setObjectAttributeRef';
	}
	func(attribValue: AttribValue, targetRef: Ref<AttribValue>): void {
		targetRef.value = attribValue;
		// _copyToRef(attribValue, targetRef);
	}
}
