import {TypedNode} from '../_Base';
import {EventContainer} from '../../containers/Event';
import {NodeContext} from '../../poly/NodeContext';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
export class TypedEventNode<K extends NodeParamsConfig> extends TypedNode<'EVENT', BaseEventNodeType, K> {
	container_controller: TypedContainerController<EventContainer> = new TypedContainerController<EventContainer>(
		this,
		EventContainer
	);
	static node_context(): NodeContext {
		return NodeContext.EVENT;
	}

	private _eval_all_params_on_dirty_bound = this._eval_all_params_on_dirty.bind(this);
	initialize_base_node() {
		// this._init_display_flag({
		// 	has_display_flag: false
		// });
		this.io.connections.init_inputs();
		this.ui_data.set_layout_horizontal();
		this.add_post_dirty_hook('_eval_all_params_on_dirty', this._eval_all_params_on_dirty_bound);
	}
	node_sibbling(name: string): BaseEventNodeType | null {
		return super.node_sibbling(name) as BaseEventNodeType | null;
	}

	// ensures that event nodes are cooked when scene is loaded
	_eval_all_params_on_dirty() {
		this.params.eval_all();
	}
	process_event(event_context: EventContext<Event>) {}

	protected dispatch_event_to_output(output_name: string, event_context: EventContext<Event>) {
		const index = this.io.outputs.get_output_index(output_name);
		if (index >= 0) {
			const connections = this.io.connections.output_connections();
			const current_connections = connections.filter((connection) => connection.output_index == index);
			const nodes: BaseEventNodeType[] = current_connections.map(
				(connection) => connection.node_dest
			) as BaseEventNodeType[];
			for (let node of nodes) {
				node.process_event(event_context);
			}
		} else {
			console.warn(`requested output '${output_name}' does not exist on node '${this.full_path()}'`);
		}
	}
}

export type BaseEventNodeType = TypedEventNode<any>;
export class BaseEventNodeClass extends TypedEventNode<any> {}
