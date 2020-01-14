import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class PostProcessObjNode extends BaseManagerObjNode {
	static type() {
		return 'post_process';
	}
	// children_context(){ return NodeContext.POST }

	initialize_node() {
		this.children_controller.init(NodeContext.POST);
		// this._init_manager();
	}
}
