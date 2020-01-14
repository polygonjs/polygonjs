import {BaseManagerObjNode} from './_BaseManager';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class CopObjNode extends BaseManagerObjNode {
	static type() {
		return 'cop';
	}
	// children_context(){ return NodeContext.COP }

	initialize_node() {
		this.children_controller.init(NodeContext.COP);
		// this._init_manager();
	}
}
