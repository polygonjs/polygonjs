import {DisplayNodeControllerCallbacks, DisplayNodeController} from '../../../utils/DisplayNodeController';
import {SubnetOutputSopNode} from '../../SubnetOutput';
import {CoreGraphNode} from '../../../../../core/graph/CoreGraphNode';
import {TypedSopNode, BaseSopNodeType} from '../../_Base';
import {NodeContext} from '../../../../poly/NodeContext';
import {GeoNodeChildrenMap} from '../../../../poly/registers/nodes/Sop';

import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {ParamsInitData} from '../../../utils/io/IOController';

export class SubnetSopNodeLike<T extends NodeParamsConfig> extends TypedSopNode<T> {
	initialize_base_node() {
		super.initialize_base_node();
		this.children_display_controller.initialize_node();
		// the inputs will be evaluated by the child input nodes
		this.cook_controller.disallow_inputs_evaluation();
	}

	// display_node and children_display controllers
	public readonly children_display_controller: SopSubnetChildrenDisplayController = new SopSubnetChildrenDisplayController(
		this
	);
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.children_display_controller.display_node_controller_callbacks()
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
	nodes_by_type<K extends keyof GeoNodeChildrenMap>(type: K): GeoNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GeoNodeChildrenMap[K][];
	}

	async cook(input_contents: CoreGroup[]) {
		const child_output_node = this.children_display_controller.output_node();
		if (child_output_node) {
			const container = await child_output_node.request_container();
			const core_content = container.core_content();
			if (core_content) {
				this.set_core_group(core_content);
			} else {
				if (child_output_node.states.error.active) {
					this.states.error.set(child_output_node.states.error.message);
				} else {
					this.set_objects([]);
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

	display_node_controller_callbacks(): DisplayNodeControllerCallbacks {
		return {
			on_display_node_remove: () => {
				this.node.set_dirty();
			},
			on_display_node_set: () => {
				this.node.set_dirty();
			},
			on_display_node_update: () => {
				this.node.set_dirty();
			},
		};
	}

	output_node() {
		if (this._output_node_needs_update) {
			this._update_output_node();
		}
		return this._output_node;
	}

	initialize_node() {
		const display_flag = this.node.flags?.display;
		if (display_flag) {
			display_flag.add_hook(() => {
				if (display_flag.active) {
					this.node.set_dirty();
				}
			});
		}

		this.node.lifecycle.add_on_child_add_hook(() => {
			this._output_node_needs_update = true;
			this.node.set_dirty();
		});
		this.node.lifecycle.add_on_child_remove_hook(() => {
			this._output_node_needs_update = true;
			this.node.set_dirty();
		});
	}

	private _update_output_node() {
		const found_node = this.node.nodes_by_type(SubnetOutputSopNode.type())[0];
		if (
			this._output_node == null ||
			found_node == null ||
			this._output_node.graph_node_id != found_node.graph_node_id
		) {
			if (this._graph_node && this._output_node) {
				this._graph_node.remove_graph_input(this._output_node);
			}

			this._output_node = found_node;

			if (this._output_node) {
				this._graph_node = this._graph_node || this._create_graph_node();

				this._graph_node.add_graph_input(this._output_node);
			}
		}
	}

	private _create_graph_node() {
		const graph_node = new CoreGraphNode(this.node.scene, 'subnet_children_display_controller');
		graph_node.add_post_dirty_hook('subnet_children_display_controller', () => {
			this.node.set_dirty();
		});
		return graph_node;
	}
}
