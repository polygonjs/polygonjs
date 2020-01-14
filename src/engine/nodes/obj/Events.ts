import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class EventsObjNode extends BaseManagerObjNode {
	static type() {
		return 'events';
	}
	// children_context() {
	// 	return NodeContext.EVENT;
	// }

	initialize_node() {
		this.children_controller.init(NodeContext.EVENT);
		// this._init_manager();
	}
}
