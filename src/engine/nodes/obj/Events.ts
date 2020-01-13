import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class EventsObjNode extends BaseManager {
	static type() {
		return 'events';
	}
	// children_context() {
	// 	return NodeContext.EVENT;
	// }

	constructor() {
		super();
		this.children_controller.init(NodeContext.EVENT);
		// this._init_manager();
	}
}
