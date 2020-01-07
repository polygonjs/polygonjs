import {BaseNode} from '../_Base';

export class BaseNodeManager extends BaseNode {
	static node_context(): NodeContext {
		return NodeContext.MANAGER;
	}

	constructor() {
		super();
	}
}
