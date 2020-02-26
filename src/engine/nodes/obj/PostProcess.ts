import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from '../../poly/NodeContext';

export class PostProcessObjNode extends BaseManagerObjNode {
	static type() {
		return 'post_process';
	}
	// children_context(){ return NodeContext.POST }

	protected _children_controller_context = NodeContext.POST;
	initialize_node() {
		this.children_controller?.init();
		// this._init_manager();
	}
}
