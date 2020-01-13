import {BaseManager} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class CopObjNode extends BaseManager {
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
