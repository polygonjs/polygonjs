import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class PostProcessObjNode extends BaseManager {
	static type() {
		return 'post_process';
	}
	// children_context(){ return NodeContext.POST }

	constructor() {
		super();
		this.children_controller.init(NodeContext.POST);
		// this._init_manager();
	}
}
