import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {ObjNodeRenderOrder} from './_Base';

export class EventsObjNode extends BaseManagerObjNode {
	public readonly render_order: number = ObjNodeRenderOrder.EVENT;
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
