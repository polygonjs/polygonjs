import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
class NodeCookEventParamsConfig extends NodeParamsConfig {
	mask = ParamConfig.STRING('/geo*', {
		callback: (node: BaseNodeType) => {
			NodeCookEventNode.PARAM_CALLBACK_update_node(node as NodeCookEventNode);
		},
	});
}
const ParamsConfig = new NodeCookEventParamsConfig();

export class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'node_cook';
	}
	static readonly OUTPUT_FIRST_NODE = 'first';
	static readonly OUTPUT_ALL_NODES = 'all';

	private _resolved_nodes: BaseNodeType[] = [];

	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(NodeCookEventNode.OUTPUT_FIRST_NODE, EventConnectionPointType.BASE),
			new EventConnectionPoint(NodeCookEventNode.OUTPUT_ALL_NODES, EventConnectionPointType.BASE),
		]);
	}

	cook() {
		this._update_node();
		this.cook_controller.end_cook();
	}

	static PARAM_CALLBACK_update_node(node: NodeCookEventNode) {
		node._update_node();
	}
	private _update_node() {
		this._reset();

		this._resolved_nodes = this.scene.nodes_controller.nodes_from_mask(this.pv.mask);
		for (let node of this._resolved_nodes) {
			node.cook_controller.add_on_cook_complete_hook(this, this._on_node_cook_complete_bound);
			this._cook_state_by_node_id.set(node.graph_node_id, false);
		}
	}

	private _dispatched_first_node_cooked: boolean = false;
	private _dispatched_all_nodes_cooked: boolean = false;
	private _cook_state_by_node_id: Map<string, boolean> = new Map();
	private _reset() {
		this._dispatched_first_node_cooked = false;
		this._cook_state_by_node_id.clear();
		for (let node of this._resolved_nodes) {
			node.cook_controller.remove_on_cook_complete_hook(this);
		}
		this._resolved_nodes = [];
	}
	private _all_nodes_have_cooked() {
		for (let node of this._resolved_nodes) {
			const state = this._cook_state_by_node_id.get(node.graph_node_id);
			if (!state) {
				return false;
			}
		}
		return true;
	}

	private _on_node_cook_complete_bound = this._on_node_cook_complete.bind(this);
	private _on_node_cook_complete(node: BaseNodeType) {
		this._cook_state_by_node_id.set(node.graph_node_id, true);
		if (!this._dispatched_first_node_cooked) {
			this._dispatched_first_node_cooked = true;
			this.dispatch_event_to_output(NodeCookEventNode.OUTPUT_FIRST_NODE, {});
		}
		if (!this._dispatched_all_nodes_cooked) {
			if (this._all_nodes_have_cooked()) {
				this._dispatched_all_nodes_cooked = true;
				this.dispatch_event_to_output(NodeCookEventNode.OUTPUT_ALL_NODES, {});
			}
		}
	}
}
