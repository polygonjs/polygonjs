import {Object3D} from 'three';
import {ObjectNamedFunction3} from './_Base';
import {_dummyReadAttributeRefVal} from '../../core/reactivity/ObjectAttributeReactivity';
import {_getOrCreateObjectAttributeRef} from '../../core/reactivity/ObjectAttributeReactivityCreateRef';
import {_matchArrayLength, _matchArrayLengthWithType} from './_ArrayUtils';
import {ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';
import {Ref} from '@vue/reactivity';
import {AttribValue} from '../../types/GlobalTypes';
import {getObjectChildrenCountRef} from '../../core/reactivity/ObjectHierarchyReactivity';
import {dummyReadRefVal} from './_Param';

export class getChildrenAttributesRef extends ObjectNamedFunction3<[string, string, Array<Ref<AttribValue>>]> {
	static override type() {
		return 'getChildrenAttributesRef';
	}
	func(
		object3D: Object3D,
		attribName: string,
		type: ParamConvertibleJsType,
		values: Ref<AttribValue>[]
	): Ref<AttribValue>[] {
		dummyReadRefVal(getObjectChildrenCountRef(object3D).value);
		_matchArrayLengthWithType(object3D.children, values, type);

		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const _refs = _getOrCreateObjectAttributeRef(child, attribName, type);
			values[i] = _refs.current;
			i++;
		}

		return values;
	}
}
