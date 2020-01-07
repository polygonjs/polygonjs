import {NodeSimple} from 'src/core/graph/NodeSimple';
import {BaseNode} from 'src/engine/nodes/_Base';

export class DisplayFlagGraphNode extends NodeSimple {
	constructor(protected _owner: BaseNode) {
		// {
		//   // Hack: trick Babel/TypeScript into allowing this before super.
		//   if (false) { super(); }
		//   let thisFn = (() => { return this; }).toString();
		//   let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
		//   eval(`${thisName} = this;`);
		// }
		super('DisplayFlagGraphNode');
		this._owner = _owner;

		this.add_post_dirty_hook(this._owner_post_display_flag_node_set_dirty.bind(this));
	}

	_owner_post_display_flag_node_set_dirty() {
		// this._owner.post_display_flag_node_set_dirty(direct_trigger_graph_node);
		this._owner.post_display_flag_node_set_dirty();
	}
}
