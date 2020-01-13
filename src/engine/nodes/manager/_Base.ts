import {BaseNode} from '../_Base';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class BaseNodeManager extends BaseNode {
	static node_context(): NodeContext {
		return NodeContext.MANAGER;
	}

	// constructor() {
	// 	super('BaseNodeManager');
	// }
}
