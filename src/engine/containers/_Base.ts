import {CoreObject} from 'src/core/Object'

import {BaseNode} from 'src/engine/nodes/_Base'

// interface ContentOption {
// 	clone?: boolean
// }

export abstract class BaseContainer<T> extends CoreObject {
	protected _node: BaseNode
	// protected _eval_key: number
	protected _content: T

	constructor() {
		super()
		// this.update_eval_key();
		this.set_content(this._default_content())
	}

	set_node(node: BaseNode) {
		this._node = node
	}
	node(): BaseNode {
		return this._node
	}

	clone() {
		let content
		const cloned_container = new (<any>this.constructor)() as BaseContainer<T>
		cloned_container.set_node(this.node())
		if ((content = this.content()) != null) {
			cloned_container.set_content(content) //, this.eval_key() );
		}
		return cloned_container
	}
	reset_caches() {}
	_default_content(): T {
		return null
	}

	set_content(content: T) {
		//, eval_key?: number){
		this.reset_caches()
		this._content = content || this._default_content()
		// this.update_eval_key(eval_key);
		this._post_set_content()
	}
	has_content(): boolean {
		return this._content != null
	}
	// content(options: ContentOption = {}) {
	// 	const clone = options['clone'] || false
	// 	if (clone) {
	// 		return this.clone_content()
	// 	} else {
	// 		return this._content
	// 	}
	// }
	content() {
		return this._content
	}
	protected _post_set_content() {}
	protected core_content() {
		return this._content
	}
	protected core_content_cloned() {
		return this._content
	}
	// abstract clone_content(): T

	// update_eval_key(eval_key?: number){
	// 	this._eval_key = eval_key || performance.now();
	// }
	// eval_key(): number {
	// 	return this._eval_key;
	// }

	infos(): object {
		return []
	}
}
