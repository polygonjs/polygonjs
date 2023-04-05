import {Object3D} from 'three';
import {CoreObject} from '../../core/geometry/Object';
import {ObjectNamedFunction3} from './_Base';
import {_getObjectAttributeRef, _dummyReadAttributeRefVal} from '../../core/reactivity/ObjectAttributeReactivity';
import {_matchArrayLength, _matchArrayLengthWithType} from './_ArrayUtils';
import {JsConnectionPointType} from '../nodes/utils/io/connections/Js';

export class getChildrenAttributes extends ObjectNamedFunction3<[string, string, Array<any>]> {
	static override type() {
		return 'getChildrenAttributes';
	}
	func(object3D: Object3D, attribName: string, jsType: JsConnectionPointType, values: any[]): any[] {
		_matchArrayLengthWithType(object3D.children, values, jsType);

		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			const value = CoreObject.attribValue(child, attribName);
			values[i] = value;
			i++;
		}

		return values;
	}
}
