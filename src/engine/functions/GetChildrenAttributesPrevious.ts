import {Object3D} from 'three';
import {ObjectNamedFunction3} from './_Base';
import {_getObjectAttributeRef, _dummyReadAttributeRefVal} from '../../core/reactivity/ObjectAttributeReactivity';
import {_matchArrayLength, _matchArrayLengthWithType} from './_ArrayUtils';
import {ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';
import {AttribValue} from '../../types/GlobalTypes';

export class getChildrenAttributesPrevious extends ObjectNamedFunction3<[string, string, Array<AttribValue>]> {
	static override type() {
		return 'getChildrenAttributesPrevious';
	}
	func(object3D: Object3D, attribName: string, type: ParamConvertibleJsType, values: AttribValue[]): AttribValue[] {
		_matchArrayLengthWithType(object3D.children, values, type);

		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const _refs = _getObjectAttributeRef(child, attribName, type);
			values[i] = _refs.previous.value;
			i++;
		}

		return values;
	}
}
