/**
 * get an instance attribute
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {GetPointAttributeJsNode} from './GetPointAttribute';

export class GetInstanceAttributeJsNode extends GetPointAttributeJsNode {
	static override type() {
		return JsType.GET_INSTANCE_ATTRIBUTE;
	}
}
