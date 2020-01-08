import {BaseManager} from './_BaseManager';

export class Events extends BaseManager {
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
