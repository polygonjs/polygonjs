import {SubnetSopNode} from '../../Subnet';
import {DisplayNodeControllerCallbacks} from '../../../utils/DisplayNodeController';
import {SubnetOutputSopNode} from '../../SubnetOutput';
import {CoreGraphNode} from '../../../../../core/graph/CoreGraphNode';

export class SopSubnetChildrenDisplayController {
	private _output_node_needs_update: boolean = true;
	private _output_node: SubnetOutputSopNode | undefined;
	private _graph_node: CoreGraphNode | undefined;
	constructor(private node: SubnetSopNode) {}

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

		this.node.lifecycle.add_on_create_hook(this._on_create_bound);

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

	private _on_create_bound = this._on_create.bind(this);
	private _on_create() {
		const subnet_input1 = this.node.create_node('subnet_input');
		const subnet_output1 = this.node.create_node('subnet_output');

		subnet_input1.ui_data.set_position(0, -100);
		subnet_output1.ui_data.set_position(0, +100);
	}

	private _create_graph_node() {
		const graph_node = new CoreGraphNode(this.node.scene, 'subnet_children_display_controller');
		graph_node.add_post_dirty_hook('subnet_children_display_controller', () => {
			this.node.set_dirty();
		});
		return graph_node;
	}
}
