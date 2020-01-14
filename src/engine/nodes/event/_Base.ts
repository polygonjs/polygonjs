import {BaseNode} from '../_Base';
import {EventContainer} from 'src/engine/containers/Event';
import {NodeContext} from 'src/engine/poly/NodeContext';

export class BaseEventNode extends BaseNode {
	static node_context(): NodeContext {
		return NodeContext.EVENT;
	}

	initialize_node() {
		this.container_controller.init(EventContainer);
		// this._init_display_flag({
		// 	has_display_flag: false
		// });

		this.add_post_dirty_hook(this._eval_all_params_on_dirty.bind(this));
	}

	// ensures that event nodes are cooked when scene is loaded
	_eval_all_params_on_dirty() {
		this.params.eval_all();
	}
}
