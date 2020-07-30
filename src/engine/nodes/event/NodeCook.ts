import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';

enum CookMode {
	ALL_TOGETHER = 'all together',
	BATCH = 'batch',
}
const COOK_MODES: CookMode[] = [CookMode.ALL_TOGETHER, CookMode.BATCH];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
import {BaseParamType} from '../../params/_Base';
class NodeCookEventParamsConfig extends NodeParamsConfig {
	mask = ParamConfig.STRING('/geo*', {
		callback: (node: BaseNodeType) => {
			NodeCookEventNode.PARAM_CALLBACK_update_resolved_nodes(node as NodeCookEventNode);
		},
	});
	force = ParamConfig.BOOLEAN(0);
	cook_mode = ParamConfig.INTEGER(COOK_MODES.indexOf(CookMode.ALL_TOGETHER), {
		menu: {
			entries: COOK_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	batch_size = ParamConfig.INTEGER(1, {visible_if: {cook_mode: COOK_MODES.indexOf(CookMode.BATCH)}});
	sep = ParamConfig.SEPARATOR();
	update_resolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			NodeCookEventNode.PARAM_CALLBACK_update_resolve(node as NodeCookEventNode);
		},
	});
	print_resolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			NodeCookEventNode.PARAM_CALLBACK_print_resolve(node as NodeCookEventNode);
		},
	});
}
const ParamsConfig = new NodeCookEventParamsConfig();

export class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'node_cook';
	}
	static readonly INPUT_TRIGGER = 'trigger';
	static readonly OUTPUT_FIRST_NODE = 'first';
	static readonly OUTPUT_EACH_NODE = 'each';
	static readonly OUTPUT_ALL_NODES = 'all';

	private _resolved_nodes: BaseNodeType[] = [];

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				NodeCookEventNode.INPUT_TRIGGER,
				EventConnectionPointType.BASE,
				this.process_event_trigger.bind(this)
			),
		]);

		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(NodeCookEventNode.OUTPUT_FIRST_NODE, EventConnectionPointType.BASE),
			new EventConnectionPoint(NodeCookEventNode.OUTPUT_EACH_NODE, EventConnectionPointType.BASE),
			new EventConnectionPoint(NodeCookEventNode.OUTPUT_ALL_NODES, EventConnectionPointType.BASE),
		]);
	}
	// for public api
	// TODO: make it more generic, with input being an enum of input names
	trigger() {
		this.process_event_trigger({});
	}

	cook() {
		this._update_resolved_nodes();
		this.cook_controller.end_cook();
	}

	private process_event_trigger(event_context: EventContext<Event>) {
		this._cook_nodes_with_mode();
	}

	private _cook_nodes_with_mode() {
		const mode = COOK_MODES[this.pv.cook_mode];
		switch (mode) {
			case CookMode.ALL_TOGETHER:
				return this._cook_nodes_all_together();
			case CookMode.BATCH:
				return this._cook_nodes_batch();
		}
		TypeAssert.unreachable(mode);
	}
	private _cook_nodes_all_together() {
		this._cook_nodes(this._resolved_nodes);
	}
	private async _cook_nodes_batch() {
		const batch_size = this.pv.batch_size;
		const batches_count = Math.ceil(this._resolved_nodes.length / batch_size);

		for (let i = 0; i < batches_count; i++) {
			const start = i * batch_size;
			const end = (i + 1) * batch_size;
			const nodes_in_batch = this._resolved_nodes.slice(start, end);
			await this._cook_nodes(nodes_in_batch);
		}
	}
	private async _cook_nodes(nodes: BaseNodeType[]) {
		const promises: Promise<any>[] = [];
		for (let node of nodes) {
			promises.push(this._cook_node(node));
		}
		return await Promise.all(promises);
	}
	private async _cook_node(node: BaseNodeType) {
		if (this.pv.force) {
			node.set_dirty(this);
		}
		return await node.request_container();
	}

	static PARAM_CALLBACK_update_resolved_nodes(node: NodeCookEventNode) {
		node._update_resolved_nodes();
	}
	private _update_resolved_nodes() {
		this._reset();

		this._resolved_nodes = this.scene.nodes_controller.nodes_from_mask(this.pv.mask || '');
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
		const event_context: EventContext<Event> = {value: {node: node}};
		if (!this._dispatched_first_node_cooked) {
			this._dispatched_first_node_cooked = true;
			this.dispatch_event_to_output(NodeCookEventNode.OUTPUT_FIRST_NODE, event_context);
		}
		if (!this._cook_state_by_node_id.get(node.graph_node_id)) {
			this.dispatch_event_to_output(NodeCookEventNode.OUTPUT_EACH_NODE, event_context);
		}
		this._cook_state_by_node_id.set(node.graph_node_id, true);

		if (!this._dispatched_all_nodes_cooked) {
			if (this._all_nodes_have_cooked()) {
				this._dispatched_all_nodes_cooked = true;
				this.dispatch_event_to_output(NodeCookEventNode.OUTPUT_ALL_NODES, {});
			}
		}
	}

	static PARAM_CALLBACK_update_resolve(node: NodeCookEventNode) {
		node._update_resolved_nodes();
	}
	static PARAM_CALLBACK_print_resolve(node: NodeCookEventNode) {
		node.print_resolve();
	}
	private print_resolve() {
		console.log(this._resolved_nodes);
	}
}
