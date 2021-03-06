/**
 * Can be triggered when nodes have cooked or to cook specific nodes.
 *
 *
 */
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
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {isBooleanTrue} from '../../../core/BooleanValue';
class NodeCookEventParamsConfig extends NodeParamsConfig {
	/** @param mask to select which nodes this will cook or listen to */
	mask = ParamConfig.STRING('/geo*', {
		callback: (node: BaseNodeType) => {
			NodeCookEventNode.PARAM_CALLBACK_update_resolved_nodes(node as NodeCookEventNode);
		},
	});
	/** @param forces cook of nodes mentioned in the mask param */
	force = ParamConfig.BOOLEAN(0);
	/** @param defines if the nodes should cook one after the other or in parallel */
	cookMode = ParamConfig.INTEGER(COOK_MODES.indexOf(CookMode.ALL_TOGETHER), {
		menu: {
			entries: COOK_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param batch size */
	batchSize = ParamConfig.INTEGER(1, {
		visibleIf: {cookMode: COOK_MODES.indexOf(CookMode.BATCH)},
		separatorAfter: true,
	});
	/** @param updates the list of nodes from the mask parameter. This can be useful if nodes are added or removed from the scene */
	updateResolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			NodeCookEventNode.PARAM_CALLBACK_update_resolve(node as NodeCookEventNode);
		},
	});
	/** @param prints the list of nodes the mask resolves to to the console. Useful for debugging */
	printResolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			NodeCookEventNode.PARAM_CALLBACK_print_resolve(node as NodeCookEventNode);
		},
	});
}
const ParamsConfig = new NodeCookEventParamsConfig();

export class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'nodeCook'> {
		return 'nodeCook';
	}
	static readonly INPUT_TRIGGER = 'trigger';
	static readonly OUTPUT_FIRST_NODE = 'first';
	static readonly OUTPUT_EACH_NODE = 'each';
	static readonly OUTPUT_ALL_NODES = 'all';

	private _resolved_nodes: BaseNodeType[] = [];

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				NodeCookEventNode.INPUT_TRIGGER,
				EventConnectionPointType.BASE,
				this.process_event_trigger.bind(this)
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
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
		this.cookController.endCook();
	}
	dispose() {
		super.dispose();
		this._reset();
	}

	private process_event_trigger(event_context: EventContext<Event>) {
		this._cook_nodes_with_mode();
	}

	private _cook_nodes_with_mode() {
		this._update_resolved_nodes(); // necesarry when triggered on scene load
		const mode = COOK_MODES[this.pv.cookMode];
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
		const batch_size = this.pv.batchSize;
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
	private _cook_node(node: BaseNodeType) {
		if (isBooleanTrue(this.pv.force)) {
			node.setDirty(this);
		}
		return node.compute();
	}

	static PARAM_CALLBACK_update_resolved_nodes(node: NodeCookEventNode) {
		node._update_resolved_nodes();
	}
	private _update_resolved_nodes() {
		this._reset();

		this._resolved_nodes = this.scene().nodesController.nodesFromMask(this.pv.mask || '');
		for (let node of this._resolved_nodes) {
			node.cookController.registerOnCookEnd(this._callbackNameForNode(node), () => {
				this._on_node_cook_complete(node);
			});
			this._cook_state_by_node_id.set(node.graphNodeId(), false);
		}
	}
	private _callbackNameForNode(node: BaseNodeType) {
		return `owner-${this.graphNodeId()}-target-${node.graphNodeId()}`;
	}

	private _dispatched_first_node_cooked: boolean = false;
	private _dispatched_all_nodes_cooked: boolean = false;
	private _cook_state_by_node_id: Map<CoreGraphNodeId, boolean> = new Map();
	private _reset() {
		this._dispatched_first_node_cooked = false;
		this._cook_state_by_node_id.clear();
		for (let node of this._resolved_nodes) {
			node.cookController.deregisterOnCookEnd(this._callbackNameForNode(node));
		}
		this._resolved_nodes = [];
	}
	private _all_nodes_have_cooked() {
		for (let node of this._resolved_nodes) {
			const state = this._cook_state_by_node_id.get(node.graphNodeId());
			if (!state) {
				return false;
			}
		}
		return true;
	}

	private _on_node_cook_complete(node: BaseNodeType) {
		const event_context: EventContext<Event> = {value: {node: node}};
		if (!this._dispatched_first_node_cooked) {
			this._dispatched_first_node_cooked = true;
			this.dispatchEventToOutput(NodeCookEventNode.OUTPUT_FIRST_NODE, event_context);
		}
		if (!this._cook_state_by_node_id.get(node.graphNodeId())) {
			this.dispatchEventToOutput(NodeCookEventNode.OUTPUT_EACH_NODE, event_context);
		}
		this._cook_state_by_node_id.set(node.graphNodeId(), true);

		if (!this._dispatched_all_nodes_cooked) {
			if (this._all_nodes_have_cooked()) {
				this._dispatched_all_nodes_cooked = true;
				this.dispatchEventToOutput(NodeCookEventNode.OUTPUT_ALL_NODES, {});
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
