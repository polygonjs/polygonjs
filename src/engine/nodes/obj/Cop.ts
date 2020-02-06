import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class CopObjNode extends BaseManagerObjNode {
	static type() {
		return 'cop';
	}
	// children_context(){ return NodeContext.COP }

	protected _children_controller_context = NodeContext.COP;
	initialize_node() {
		this.children_controller?.init();
		// this._init_manager();
	}
}
