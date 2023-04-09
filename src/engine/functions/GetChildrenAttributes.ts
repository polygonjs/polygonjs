import {Object3D} from 'three';
import {CoreObject} from '../../core/geometry/Object';
import {ObjectNamedFunction3} from './_Base';
import {_getObjectAttributeRef, _dummyReadAttributeRefVal} from '../../core/reactivity/ObjectAttributeReactivity';
import {_matchArrayLength, _matchArrayLengthWithType} from './_ArrayUtils';
import {ParamConvertibleJsType} from '../nodes/utils/io/connections/Js';

export class getChildrenAttributes extends ObjectNamedFunction3<[string, string, Array<any>]> {
	static override type() {
		return 'getChildrenAttributes';
	}
	func(object3D: Object3D, attribName: string, type: ParamConvertibleJsType, values: any[]): any[] {
		_matchArrayLengthWithType(object3D.children, values, type);

		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const value = CoreObject.attribValue(child, attribName);
			_dummyReadAttributeRefVal(_getObjectAttributeRef(child, attribName, type).current.value);
			values[i] = value;
			i++;
		}

		return values;
	}
}
