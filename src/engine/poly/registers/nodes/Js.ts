import {CATEGORY_JS} from './Category';

import {AttributeJsNode} from '../../../nodes/js/Attribute';
import {GlobalsJsNode} from '../../../nodes/js/Globals';
import {OutputJsNode} from '../../../nodes/js/Output';
import {ParamJsNode} from '../../../nodes/js/Param';

export interface JsNodeChildrenMap {
	attribute: AttributeJsNode;
	globals: GlobalsJsNode;
	output: OutputJsNode;
	param: ParamJsNode;
}

import {Poly} from '../../../Poly';
export class JsRegister {
	static run(poly: Poly) {
		poly.register_node(AttributeJsNode, CATEGORY_JS.GLOBALS);
		poly.register_node(GlobalsJsNode, CATEGORY_JS.GLOBALS);
		poly.register_node(OutputJsNode, CATEGORY_JS.GLOBALS);
		poly.register_node(ParamJsNode, CATEGORY_JS.GLOBALS);
	}
}
