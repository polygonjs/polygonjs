import {DisplayNodeControllerCallbacks, DisplayNodeController} from '../../../utils/DisplayNodeController';
import {SubnetOutputSopNode} from '../../SubnetOutput';
import {CoreGraphNode} from '../../../../../core/graph/CoreGraphNode';
import {TypedSopNode, BaseSopNodeType} from '../../_Base';
import {NodeContext} from '../../../../poly/NodeContext';
import {GeoNodeChildrenMap} from '../../../../poly/registers/nodes/Sop';

import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {ParamsInitData} from '../../../utils/io/IOController';
import {Constructor, valueof} from '../../../../../types/GlobalTypes';

export class SubnetSopNodeLike<T extends NodeParamsConfig> extends TypedSopNode<T> {
	initializeBaseNode() {
		super.initializeBaseNode();
		this.childrenDisplayController.initializeNode();
		// the inputs will be evaluated by the child input nodes
		this.cookController.disallow_inputs_evaluation();
	}

	// display_node and children_display controllers
	public readonly childrenDisplayController: SopSubnetChildrenDisplayController = new SopSubnetChildrenDisplayController(
		this
	);
	public readonly displayNodeController: DisplayNodeController = new DisplayNodeController(
		this,
		this.childrenDisplayController.displayNodeControllerCallbacks()
	);
	//

	protected _children_controller_context = NodeContext.SOP;

	createNode<S extends keyof GeoNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): GeoNodeChildrenMap[S];
	createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<GeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseSopNodeType[];
	}
	nodesByType<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodesByType(type) as GeoNodeChildrenMap[K][];
	}

	async cook(input_contents: CoreGroup[]) {
		const child_output_node = this.childrenDisplayController.output_node();
		if (child_output_node) {
			const container = await child_output_node.requestContainer();
			const core_content = container.coreContent();
			if (core_content) {
				this.setCoreGroup(core_content);
			} else {
				if (child_output_node.states.error.active()) {
					this.states.error.set(child_output_node.states.error.message());
				} else {
					this.setObjects([]);
				}
			}
		} else {
			this.states.error.set('no output node found inside subnet');
		}
	}
}

export class SopSubnetChildrenDisplayController {
	private _output_node_needs_update: boolean = true;
	private _output_node: SubnetOutputSopNode | undefined;
	private _graph_node: CoreGraphNode | undefined;
	constructor(private node: SubnetSopNodeLike<any>) {}

	dispose() {
		this._graph_node?.dispose();
	}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {
				this.node.setDirty();
			},
			onDisplayNodeSet: () => {
				this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				this.node.setDirty();
			},
		};
	}

	output_node() {
		if (this._output_node_needs_update) {
			this._update_output_node();
		}
		return this._output_node;
	}

	initializeNode() {
		const display_flag = this.node.flags?.display;
		if (display_flag) {
			display_flag.onUpdate(() => {
				if (display_flag.active()) {
					this.node.setDirty();
				}
			});
		}

		this.node.lifecycle.add_on_child_add_hook(() => {
			this._output_node_needs_update = true;
			this.node.setDirty();
		});
		this.node.lifecycle.add_on_child_remove_hook(() => {
			this._output_node_needs_update = true;
			this.node.setDirty();
		});
	}

	private _update_output_node() {
		const found_node = this.node.nodesByType(SubnetOutputSopNode.type())[0];
		if (
			this._output_node == null ||
			found_node == null ||
			this._output_node.graphNodeId() != found_node.graphNodeId()
		) {
			if (this._graph_node && this._output_node) {
				this._graph_node.removeGraphInput(this._output_node);
			}

			this._output_node = found_node;

			if (this._output_node) {
				this._graph_node = this._graph_node || this._create_graph_node();

				this._graph_node.addGraphInput(this._output_node);
			}
		}
	}

	private _create_graph_node() {
		const graph_node = new CoreGraphNode(this.node.scene(), 'subnetChildrenDisplayController');
		graph_node.addPostDirtyHook('subnetChildrenDisplayController', () => {
			this.node.setDirty();
		});
		return graph_node;
	}
}
