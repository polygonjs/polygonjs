import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {BaseEventConnectionPoint} from '../utils/io/connections/Event';
import {MapUtils} from '../../../core/MapUtils';

type DispatchHook = (event_context: EventContext<Event>) => void;

export class TypedEventNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.EVENT, K> {
	static nodeContext(): NodeContext {
		return NodeContext.EVENT;
	}

	initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		// this.addPostDirtyHook('_eval_all_params_on_dirty', this._eval_all_params_on_dirty_bound);
		// cook is required for some nodes like event/animation
		this.addPostDirtyHook('cook_without_inputs_on_dirty', this._cook_without_inputs_bound);

		this.io.inputs.set_depends_on_inputs(false);
		this.io.connections.initInputs();
		this.io.connection_points.spare_params.initializeNode();
	}

	// ensures that event nodes are cooked when scene is loaded
	// private _eval_all_params_on_dirty_bound = this._eval_all_params_on_dirty.bind(this);
	// _eval_all_params_on_dirty() {
	// 	this.params.eval_all();
	// }
	private _cook_without_inputs_bound = this._cook_without_inputs.bind(this);
	_cook_without_inputs() {
		this.cookController.cook_main_without_inputs();
	}
	cook() {
		this.cookController.endCook();
	}
	// eval_params_and_process_event(event_context: EventContext<Event>, connection_point: BaseEventConnectionPoint) {
	// 	// not evaluation params now, since we are evaluating them on dirty
	// 	// this.params.eval_all().then(()=>{
	// 		this.process_event(event_context, connection_point)
	// 	// })
	// }
	process_event_via_connection_point(event_context: EventContext<Event>, connection_point: BaseEventConnectionPoint) {
		if (connection_point.event_listener) {
			connection_point.event_listener(event_context);
		} else {
			this.process_event(event_context);
		}
	}
	process_event(event_context: EventContext<Event>) {}

	//
	//
	// It may be more practical to use cook, rather than process_event
	// to benefit from params evaluation.
	// But that would mean that each node receiving an event would make the successors dirty,
	// which may also be problematic. So for now, I use process_event
	//
	//
	protected async dispatch_event_to_output(output_name: string, event_context: EventContext<Event>) {
		this.run_on_dispatch_hook(output_name, event_context);
		const index = this.io.outputs.get_output_index(output_name);
		if (index >= 0) {
			const connections = this.io.connections.outputConnections();
			const current_connections = connections.filter((connection) => connection.output_index == index);
			let dest_node: BaseEventNodeType;
			for (let connection of current_connections) {
				dest_node = connection.node_dest;
				const connection_point = dest_node.io.inputs.named_input_connection_points[connection.input_index];
				dest_node.process_event_via_connection_point(event_context, connection_point);
			}
			// const nodes = current_connections.map((connection) => connection.node_dest);
			// for (let node of nodes) {
			// 	node.process_event(event_context);
			// }
		} else {
			console.warn(`requested output '${output_name}' does not exist on node '${this.fullPath()}'`);
		}
	}

	private _on_dispatch_hooks_by_output_name: Map<string, DispatchHook[]> | undefined;
	public onDispatch(output_name: string, callback: DispatchHook) {
		this._on_dispatch_hooks_by_output_name = this._on_dispatch_hooks_by_output_name || new Map();
		MapUtils.push_on_array_at_entry(this._on_dispatch_hooks_by_output_name, output_name, callback);
	}
	private run_on_dispatch_hook(output_name: string, event_context: EventContext<Event>) {
		if (this._on_dispatch_hooks_by_output_name) {
			const hooks = this._on_dispatch_hooks_by_output_name.get(output_name);
			if (hooks) {
				for (let hook of hooks) {
					hook(event_context);
				}
			}
		}
	}
}

export type BaseEventNodeType = TypedEventNode<any>;
export class BaseEventNodeClass extends TypedEventNode<any> {}
