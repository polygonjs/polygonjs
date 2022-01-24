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
			NodeCookEventNode.PARAM_CALLBACK_updateResolvedNodes(node as NodeCookEventNode);
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
	/** @param if on, we only trigger the first time a specific node has cooked. If false, we register every time a node cooks */
	registerOnlyFirstCooks = ParamConfig.BOOLEAN(true);
	/** @param updates the list of nodes from the mask parameter. This can be useful if nodes are added or removed from the scene */
	updateResolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			NodeCookEventNode.PARAM_CALLBACK_updateResolve(node as NodeCookEventNode);
		},
	});
	/** @param prints the list of nodes the mask resolves to to the console. Useful for debugging */
	printResolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			NodeCookEventNode.PARAM_CALLBACK_printResolve(node as NodeCookEventNode);
		},
	});
}
const ParamsConfig = new NodeCookEventParamsConfig();

export class NodeCookEventNode extends TypedEventNode<NodeCookEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'nodeCook'> {
		return 'nodeCook';
	}
	static readonly INPUT_TRIGGER = 'trigger';
	static readonly OUTPUT_FIRST_NODE = 'first';
	static readonly OUTPUT_EACH_NODE = 'each';
	static readonly OUTPUT_ALL_NODES = 'all';

	private _resolvedNodes: BaseNodeType[] = [];

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				NodeCookEventNode.INPUT_TRIGGER,
				EventConnectionPointType.BASE,
				this.processEventTrigger.bind(this)
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
		this.processEventTrigger({});
	}

	override cook() {
		this._updateResolvedNodes();
		this.cookController.endCook();
	}
	override dispose() {
		super.dispose();
		this._reset();
	}

	resolvedNodes() {
		return this._resolvedNodes;
	}

	private processEventTrigger(event_context: EventContext<Event>) {
		this._cookNodesWithMode();
	}

	private _cookNodesWithMode() {
		this._updateResolvedNodes(); // necesarry when triggered on scene load
		const mode = COOK_MODES[this.pv.cookMode];
		switch (mode) {
			case CookMode.ALL_TOGETHER:
				return this._cookNodesAllTogether();
			case CookMode.BATCH:
				return this._cookNodesInBatch();
		}
		TypeAssert.unreachable(mode);
	}
	private _cookNodesAllTogether() {
		this._cookNodes(this._resolvedNodes);
	}
	private async _cookNodesInBatch() {
		const batch_size = this.pv.batchSize;
		const batches_count = Math.ceil(this._resolvedNodes.length / batch_size);

		for (let i = 0; i < batches_count; i++) {
			const start = i * batch_size;
			const end = (i + 1) * batch_size;
			const nodes_in_batch = this._resolvedNodes.slice(start, end);
			await this._cookNodes(nodes_in_batch);
		}
	}
	private async _cookNodes(nodes: BaseNodeType[]) {
		const promises: Promise<any>[] = [];
		for (let node of nodes) {
			promises.push(this._cookNode(node));
		}
		return await Promise.all(promises);
	}
	private _cookNode(node: BaseNodeType) {
		if (isBooleanTrue(this.pv.force)) {
			node.setDirty(this);
		}
		return node.compute();
	}

	static PARAM_CALLBACK_updateResolvedNodes(node: NodeCookEventNode) {
		node._updateResolvedNodes();
	}
	private _updateResolvedNodes() {
		this._reset();

		this._resolvedNodes = this.scene().nodesController.nodesFromMask(this.pv.mask || '');
		for (let node of this._resolvedNodes) {
			node.cookController.registerOnCookEnd(this._callbackNameForNode(node), () => {
				this._onNodeCookComplete(node);
			});
			this._cookStateByNodeId.set(node.graphNodeId(), false);
		}
	}
	private _callbackNameForNode(node: BaseNodeType) {
		return `owner-${this.graphNodeId()}-target-${node.graphNodeId()}`;
	}

	private _dispatchedFirstNodeCooked: boolean = false;
	private _dispatchedAllNodesCooked: boolean = false;
	private _cookStateByNodeId: Map<CoreGraphNodeId, boolean> = new Map();
	private _reset() {
		this._dispatchedFirstNodeCooked = false;
		this._cookStateByNodeId.clear();
		for (let node of this._resolvedNodes) {
			node.cookController.deregisterOnCookEnd(this._callbackNameForNode(node));
		}
		this._resolvedNodes = [];
	}
	private _allNodesHaveCooked() {
		for (let node of this._resolvedNodes) {
			const state = this._cookStateByNodeId.get(node.graphNodeId());
			if (!state) {
				return false;
			}
		}
		return true;
	}

	private _onNodeCookComplete(node: BaseNodeType) {
		const registerOnlyFirstCook = isBooleanTrue(this.pv.registerOnlyFirstCooks);
		const eventContext: EventContext<Event> = {value: {node: node}};
		if (!this._dispatchedFirstNodeCooked || !registerOnlyFirstCook) {
			this._dispatchedFirstNodeCooked = true;
			this.dispatchEventToOutput(NodeCookEventNode.OUTPUT_FIRST_NODE, eventContext);
		}
		const nodeHasCooked = this._cookStateByNodeId.get(node.graphNodeId());

		if (!nodeHasCooked || !registerOnlyFirstCook) {
			this.dispatchEventToOutput(NodeCookEventNode.OUTPUT_EACH_NODE, eventContext);
		}
		this._cookStateByNodeId.set(node.graphNodeId(), true);

		if (!this._dispatchedAllNodesCooked || !registerOnlyFirstCook) {
			if (this._allNodesHaveCooked()) {
				this._dispatchedAllNodesCooked = true;
				this.dispatchEventToOutput(NodeCookEventNode.OUTPUT_ALL_NODES, {});
			}
		}
	}

	static PARAM_CALLBACK_updateResolve(node: NodeCookEventNode) {
		node._updateResolvedNodes();
	}
	static PARAM_CALLBACK_printResolve(node: NodeCookEventNode) {
		node.printResolve();
	}
	private printResolve() {
		console.log(this._resolvedNodes);
	}
}
