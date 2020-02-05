import {BaseNodeType} from '../_Base';

export class NodeSerializer {
	constructor(private node: BaseNodeType) {}

	serialize() {
		return this.to_json();
	}

	to_json(include_param_components: boolean = false) {
		// const spare_params_json_by_name = {};
		// lodash_each(this.node.spare_param_names(), param_name=> {
		// 	const param = this.node.spare_param(param_name);
		// 	spare_params_json_by_name[param_name] = param.graph_node_id;
		// });
		const children_indices: string[] = this.node.children().map((node) => node.graph_node_id);

		const input_indices: Array<string | undefined> = this.node.io.inputs
			.inputs()
			.map((node) => (node != null ? node.graph_node_id : undefined));
		const connection_output_indices = this.node.io.connections
			.input_connections()
			?.map((connection) => (connection != null ? connection.output_index : undefined));
		const named_inputs = this.node.io.inputs.named_input_connection_points.map((i) => i.to_json());
		const named_outputs = this.node.io.outputs.named_output_connection_points.map((o) => o.to_json());

		const data = {
			name: this.node.name,
			type: this.node.type,
			graph_node_id: this.node.graph_node_id,
			is_dirty: this.node.is_dirty,
			ui_data: this.node.ui_data.to_json(),
			error_message: this.node.states.error.message,
			children: children_indices,
			inputs: input_indices,
			input_connection_output_indices: connection_output_indices,
			named_inputs: named_inputs,
			named_outputs: named_outputs,
			params: this.to_json_params(include_param_components),
			spare_params: this.to_json_spare_params(include_param_components),
			override_clonable_state: this.node.io.inputs.override_clonable_state(),
			inputs_clonable_state_with_override: this.node.io.inputs.inputs_clonable_state_with_override(),
			flags: {
				//has_display: this.has_display_flag()
				display: this.node.flags?.display?.active,
				bypass: this.node.flags?.bypass?.active,
			},
			selection: null as string[] | null,
		};

		if (this.node.children_controller.children_allowed()) {
			data['selection'] = this.node.selection.to_json();
		}

		return data;
	}

	to_json_params_from_names(param_names: string[], include_components: boolean = false) {
		const params_json_by_name: Dictionary<string> = {};
		for (let param_name of param_names) {
			const param = this.node.params.get(param_name);
			if (param) {
				params_json_by_name[param_name] = param.graph_node_id;

				if (include_components && param.is_multiple && param.components) {
					for (let component of param.components) {
						params_json_by_name[component.name] = component.graph_node_id;
					}
				}
			}
		}
		return params_json_by_name;
	}
	to_json_params(include_components: boolean = false) {
		return this.to_json_params_from_names(this.node.params.non_spare_names, include_components);
	}
	to_json_spare_params(include_components: boolean = false) {
		return this.to_json_params_from_names(this.node.params.spare_names, include_components);
	}
}
