import {BaseState} from './Base';

export class TimeDependentState extends BaseState {
	active() {
		return this.are_params_time_dependent() || this.are_inputs_time_dependent();
	}

	are_params_time_dependent(): boolean {
		const param_names = this.node.params.names;
		for (let param_name of param_names) {
			const param = this.node.params.get(param_name);
			if (param && param.states.time_dependent.active()) {
				return true;
			}
		}
		return false;
	}

	are_inputs_time_dependent(): boolean {
		const inputs = this.node.io.inputs.inputs();
		for (let input of inputs) {
			if (input && input.states.time_dependent.active()) {
				return true;
			}
		}
		return false;
	}

	force_time_dependent() {
		const predecessor_ids = this.node.graphPredecessors().map((n) => n.graphNodeId());
		const frame_node = this.node.scene().timeController.graph_node;
		if (!predecessor_ids.includes(frame_node.graphNodeId())) {
			this.node.addGraphInput(frame_node, false);
		}
	}
	unforce_time_dependent() {
		const frame_node = this.node.scene().timeController.graph_node;
		this.node.removeGraphInput(frame_node);
	}
}
