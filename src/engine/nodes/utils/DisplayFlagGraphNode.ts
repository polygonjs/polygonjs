import {NodeSimple} from 'src/core/graph/NodeSimple';
import {BaseNode} from 'src/engine/nodes/_Base';

export class DisplayFlagGraphNode extends NodeSimple {
	constructor(protected _owner: BaseNode) {
		super('DisplayFlagGraphNode');
		this._owner = _owner;

		this.add_post_dirty_hook(this._owner_post_display_flag_node_set_dirty.bind(this));
	}

	_owner_post_display_flag_node_set_dirty() {
		// this._owner.post_display_flag_node_set_dirty(); // TODO: typescript
	}
}
