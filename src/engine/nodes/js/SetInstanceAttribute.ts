/**
 * Update an instance attribute
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {SetPointAttributeJsNode} from './SetPointAttribute';

export class SetInstanceAttributeJsNode extends SetPointAttributeJsNode {
	static override type() {
		return JsType.SET_INSTANCE_ATTRIBUTE;
	}
}
