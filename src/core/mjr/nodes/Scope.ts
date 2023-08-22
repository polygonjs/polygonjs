import {Branch} from './Branch';
import {RunState} from './Common';
import {Node} from './Node';

export class ScopeNode<T extends Node = Node> extends Branch<T> {
	public override run(): RunState {
		if (!this.ip) {
			return RunState.FAIL;
		}
		const {current} = this.ip;
		for (; this.n < this.children.length; this.n++) {
			const node = this.children[this.n];

			if (node instanceof Branch) {
				if (!(node instanceof ScopeNode)) this.ip.current = node;
			} else {
				this.ip.blocking = this.sync || node.sync;
			}

			const status: RunState = node.run();
			if (status === RunState.SUCCESS || status === RunState.HALT) return status;
		}
		this.ip.current = current;
		while (this.ip.current instanceof ScopeNode) {
			this.ip.current = this.ip.current.parent;
		}
		this.reset();
		return RunState.FAIL;
	}
}
