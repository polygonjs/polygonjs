import {BaseNodeType} from '../_Base';
import {NodeUIDataJson} from './UIData';
import {TypedNamedConnectionPointData} from './connections/NamedConnectionPoint';
import {ConnectionPointType} from './connections/ConnectionPointType';

export interface NodeSerializerData {
	name: string;
	type: string;
	graph_node_id: string;
	is_dirty: boolean;
	ui_data_json: NodeUIDataJson;
	error_message: string | undefined;
	children: string[];
	inputs: Array<string | undefined>;
	input_connection_output_indices: Array<number | undefined> | undefined;
	named_input_connections: TypedNamedConnectionPointData<ConnectionPointType>[];
	named_output_connections: TypedNamedConnectionPointData<ConnectionPointType>[];
	param_ids: string[];
	// spare_params: Dictionary<string>;
	override_clonable_state: boolean;
	inputs_clonable_state_with_override: boolean[];
	flags?: {
		//has_display: this.has_display_flag()
		display?: boolean;
		bypass?: boolean;
	};
	selection?: string[];
}

export class NodeSerializer {
	constructor(private node: BaseNodeType) {}

	// serialize() {
	// 	return this.to_json();
	// }

	// TODO: find a way to not re-create a json everytime
	to_json(include_param_components: boolean = false): NodeSerializerData {
		// const spare_params_json_by_name = {};
		// lodash_each(this.node.spare_param_names(), param_name=> {
		// 	const param = this.node.spare_param(param_name);
		// 	spare_params_json_by_name[param_name] = param.graph_node_id;
		// });

		const data = {
			name: this.node.name,
			type: this.node.type,
			graph_node_id: this.node.graph_node_id,
			is_dirty: this.node.is_dirty,
			ui_data_json: this.node.ui_data.to_json(),
			error_message: this.node.states.error.message,
			children: this.children_ids(),
			inputs: this.input_ids(),
			input_connection_output_indices: this.connection_input_indices(),
			named_input_connections: this.named_input_connections(),
			named_output_connections: this.named_output_connections(),
			param_ids: this.to_json_params(include_param_components),
			// spare_params: this.to_json_spare_params(include_param_components),
			override_clonable_state: this.node.io.inputs.override_clonable_state(),
			inputs_clonable_state_with_override: this.node.io.inputs.inputs_clonable_state_with_override(),
			flags: {
				//has_display: this.has_display_flag()
				display: this.node.flags?.display?.active,
				bypass: this.node.flags?.bypass?.active,
			},
			selection: undefined as string[] | undefined,
		};

		if (this.node.children_allowed() && this.node.children_controller) {
			data['selection'] = this.node.children_controller.selection.to_json();
		}

		return data;
	}

	children_ids(): string[] {
		return this.node.children().map((node) => node.graph_node_id);
	}

	input_ids(): (string | undefined)[] {
		return this.node.io.inputs.inputs().map((node) => (node != null ? node.graph_node_id : undefined));
	}

	connection_input_indices() {
		return this.node.io.connections
			.input_connections()
			?.map((connection) => (connection != null ? connection.output_index : undefined));
	}
	named_input_connections() {
		return this.node.io.inputs.named_input_connection_points.map((i) => i.to_json());
	}
	named_output_connections() {
		return this.node.io.outputs.named_output_connection_points.map((o) => o.to_json());
	}

	to_json_params_from_names(param_names: string[], include_components: boolean = false) {
		return param_names.map((param_name) => {
			return this.node.params.get(param_name)!.graph_node_id;
		});
		// const params_json_by_name: Dictionary<string> = {};
		// for (let param_name of param_names) {
		// 	const param = this.node.params.get(param_name);
		// 	if (param) {
		// 		params_json_by_name[param_name] = param.graph_node_id;

		// 		if (include_components && param.is_multiple && param.components) {
		// 			for (let component of param.components) {
		// 				params_json_by_name[component.name] = component.graph_node_id;
		// 			}
		// 		}
		// 	}
		// }
		// return params_json_by_name;
	}
	to_json_params(include_components: boolean = false) {
		return this.to_json_params_from_names(this.node.params.names, include_components);
	}
	// to_json_spare_params(include_components: boolean = false) {
	// 	return this.to_json_params_from_names(this.node.params.spare_names, include_components);
	// }
}
