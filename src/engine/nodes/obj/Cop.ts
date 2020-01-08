import {BaseManager} from './_BaseManager';

export class Cop extends BaseManager {
	static type() {
		return 'cop';
	}
	// children_context(){ return NodeContext.COP }

	constructor() {
		super();
		this.children_controller.init(NodeContext.COP);
		// this._init_manager();
	}
}
