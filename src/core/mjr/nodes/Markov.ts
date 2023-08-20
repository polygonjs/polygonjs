import {Branch} from './Branch';
import {Node} from './Node';
import {NodeOptions} from './Common';
import {SequenceNode} from './Sequence';
export class MarkovNode<T extends Node = Node> extends Branch<T> {
	constructor(options: NodeOptions<T>) {
		super(options);

		if (options.child) (<Node[]>this.children).push(options.child);
		this.grid = ip?.grid;
	}

	public override run() {
		this.n = 0;
		return SequenceNode.prototype.run.apply(this);
	}
}
