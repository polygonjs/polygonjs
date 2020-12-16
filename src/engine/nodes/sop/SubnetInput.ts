/**
 * Fetches the input from a parent subnet node.
 *
 * @remarks
 * Can only be created inside a subnet SOP.
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {NetworkChildNodeType} from '../../poly/NodeContext';
class SubnetInputSopParamsConfig extends NodeParamsConfig {
	/** @param sets which input of the parent subnet node is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		range_locked: [true, true],
		callback: (node: BaseNodeType) => {
			SubnetInputSopNode.PARAM_CALLBACK_reset(node as SubnetInputSopNode);
		},
	});
}
const ParamsConfig = new SubnetInputSopParamsConfig();

export class SubnetInputSopNode extends TypedSopNode<SubnetInputSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return NetworkChildNodeType.INPUT;
	}

	private _current_parent_input_graph_node: CoreGraphNode | undefined;

	initialize_node() {
		this.io.inputs.set_count(0);

		this.lifecycle.add_on_add_hook(() => {
			this.set_parent_input_dependency();
		});
	}

	async cook() {
		const input_index = this.pv.input;
		const parent = this.parent;
		if (parent) {
			if (parent.io.inputs.has_input(input_index)) {
				const container = await parent.container_controller.request_input_container(input_index);
				if (container) {
					const core_group = container.core_content();
					if (core_group) {
						this.set_core_group(core_group);
						return;
					}
				}
			} else {
				this.states.error.set(`parent has no input ${input_index}`);
			}
			this.cook_controller.end_cook();
		} else {
			this.states.error.set(`subnet input has no parent`);
		}
	}

	static PARAM_CALLBACK_reset(node: SubnetInputSopNode) {
		node.set_parent_input_dependency();
	}
	private set_parent_input_dependency() {
		if (this._current_parent_input_graph_node) {
			this.remove_graph_input(this._current_parent_input_graph_node);
		}

		const parent = this.parent;
		if (parent) {
			this._current_parent_input_graph_node = parent.io.inputs.input_graph_node(this.pv.input);
			this.add_graph_input(this._current_parent_input_graph_node);
		}
	}
}
