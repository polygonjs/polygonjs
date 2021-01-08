import {BaseState} from './Base';

export class TimeDependentState extends BaseState {
	get active() {
		return this.are_params_time_dependent() || this.are_inputs_time_dependent();
	}

	are_params_time_dependent(): boolean {
		const param_names = this.node.params.names;
		for (let param_name of param_names) {
			const param = this.node.params.get(param_name);
			if (param && param.states.time_dependent.active) {
				return true;
			}
		}
		return false;
	}

	are_inputs_time_dependent(): boolean {
		const inputs = this.node.io.inputs.inputs();
		for (let input of inputs) {
			if (input && input.states.time_dependent.active) {
				return true;
			}
		}
		return false;
	}

	force_time_dependent() {
		const predecessor_ids = this.node.graph_predecessors().map((n) => n.graph_node_id);
		const frame_node = this.node.scene.timeController.graph_node;
		if (!predecessor_ids.includes(frame_node.graph_node_id)) {
			this.node.add_graph_input(frame_node, false);
		}
	}
	unforce_time_dependent() {
		const frame_node = this.node.scene.timeController.graph_node;
		this.node.remove_graph_input(frame_node);
	}
}
