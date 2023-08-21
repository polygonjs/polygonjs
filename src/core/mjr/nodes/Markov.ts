import {Branch} from './Branch';
import {Node} from './Node';
import {} from './Common';
import {SequenceNode} from './Sequence';
import {Interpreter} from '../Interpreter';

export class MarkovNode<T extends Node = Node> extends Branch<T> {
	constructor(child?: Node, ip?: Interpreter) {
		super();
		if (child) (<Node[]>this.children).push(child);
		this.grid = ip?.grid;
		if (ip) {
			this.ip = ip;
		}
	}

	public override run() {
		this.n = 0;
		return SequenceNode.prototype.run.apply(this);
	}
}
