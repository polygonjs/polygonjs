import {TypedNode} from '../_Base';
import {EventContainer} from 'src/engine/containers/Event';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export class TypedEventNode<K extends NodeParamsConfig> extends TypedNode<'EVENT', BaseEventNodeType, K> {
	container_controller: TypedContainerController<EventContainer> = new TypedContainerController<EventContainer>(
		this,
		EventContainer
	);
	static node_context(): NodeContext {
		return NodeContext.EVENT;
	}

	initialize_base_node() {
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

export type BaseEventNodeType = TypedEventNode<any>;
export class BaseEventNodeClass extends TypedEventNode<any> {}
