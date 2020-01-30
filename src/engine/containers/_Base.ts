import {CoreObject} from 'src/core/Object';

import {BaseNodeType} from 'src/engine/nodes/_Base';

// interface ContentOption {
// 	clone?: boolean
// }

import {ContainableMap} from './utils/ContainableMap';
type K = keyof ContainableMap;
type Containable = ContainableMap[K];

export abstract class TypedContainer<T extends Containable> extends CoreObject {
	// protected _node: BaseNode;
	// protected _eval_key: number
	protected _content!: T;

	constructor(protected _node: BaseNodeType) {
		super();
		// this.update_eval_key();
		// this.set_content(this._default_content());
	}

	set_node(node: BaseNodeType) {
		this._node = node;
	}
	node(): BaseNodeType {
		return this._node;
	}

	clone() {
		let content;
		const cloned_container = new (<any>this.constructor)() as TypedContainer<T>;
		cloned_container.set_node(this.node());
		if ((content = this.content()) != null) {
			cloned_container.set_content(content); //, this.eval_key() );
		}
		return cloned_container;
	}
	reset_caches() {}
	// abstract _default_content(): T;

	set_content(content: T) {
		//, eval_key?: number){
		this.reset_caches();
		this._content = content; //|| this._default_content();
		// this.update_eval_key(eval_key);
		this._post_set_content();
	}
	has_content(): boolean {
		return this._content != null;
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
		return this._content;
	}
	protected _post_set_content() {}
	public core_content(): T | undefined {
		return this._content;
	}
	public core_content_cloned(): T | undefined {
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
