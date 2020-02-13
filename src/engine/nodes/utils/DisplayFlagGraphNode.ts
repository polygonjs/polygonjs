import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import {BaseNodeType} from 'src/engine/nodes/_Base';

export class DisplayFlagGraphNode extends CoreGraphNode {
	private _owner_post_display_flag_node_set_dirty_bound = this._owner_post_display_flag_node_set_dirty.bind(this);
	constructor(protected _owner: BaseNodeType) {
		super(_owner.scene, 'DisplayFlagGraphNode');
		this._owner = _owner;

		this.add_post_dirty_hook(this._owner_post_display_flag_node_set_dirty_bound);
	}

	_owner_post_display_flag_node_set_dirty() {
		// this._owner.post_display_flag_node_set_dirty(); // TODO: typescript
	}
}
