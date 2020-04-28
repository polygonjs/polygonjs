import {TypedNode} from '../nodes/_Base';

import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export abstract class TypedContainer<NC extends NodeContext> {
	protected _content!: ContainableMap[NC];

	constructor(protected _node: TypedNode<NC, any>) {
		// this.update_eval_key();
		// this.set_content(this._default_content());
	}

	set_node(node: TypedNode<NC, any>) {
		this._node = node;
	}
	node(): TypedNode<NC, any> {
		return this._node;
	}

	// clone() {
	// 	let content;
	// 	const cloned_container = new (<any>this.constructor)() as TypedContainer<T>;
	// 	cloned_container.set_node(this.node());
	// 	if ((content = this.content()) != null) {
	// 		cloned_container.set_content(content); //, this.eval_key() );
	// 	}
	// 	return cloned_container;
	// }
	// reset_caches() {}

	set_content(content: ContainableMap[NC]) {
		// this.reset_caches();
		this._content = content;
		this._post_set_content();
	}
	has_content(): boolean {
		return this._content != null;
	}

	content() {
		return this._content;
	}
	protected _post_set_content() {}
	public core_content(): ContainableMap[NC] | undefined {
		return this._content;
	}
	public core_content_cloned(): ContainableMap[NC] | undefined {
		return this._content;
	}
	// abstract clone_content(): T

	// update_eval_key(eval_key?: number){
	// 	this._eval_key = eval_key || performance.now();
	// }
	// eval_key(): number {
	// 	return this._eval_key;
	// }

	infos(): any {
		return [];
	}
}

export class BaseContainer extends TypedContainer<any> {}
