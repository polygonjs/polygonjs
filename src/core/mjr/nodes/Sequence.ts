import {Branch} from './Branch';
import {Node} from './Node';
import {ScopeNode} from './Scope';
import {RunState} from './Common';

export class SequenceNode<T extends Node = Node> extends Branch<T> {
	public override run() {
		if (!this.ip) {
			console.warn('no ip');
			return RunState.FAIL;
		}
		for (; this.n < this.children.length; this.n++) {
			const node = this.children[this.n];

			if (node instanceof Branch) {
				if (!(node instanceof ScopeNode)) this.ip.current = node;
			} else {
				this.ip.blocking = this.sync || node.sync;
			}
			const status = node.run();
			if (status === RunState.SUCCESS || status === RunState.HALT) return status;
		}
		this.ip.current = this.ip.current?.parent || null;
		this.reset();
		return RunState.FAIL;
	}
}
