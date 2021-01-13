import {BaseNodeType} from '../_Base';
import {NodeUIDataJson} from './UIData';
import {BaseConnectionPointData} from './io/connections/_Base';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

export interface NodeSerializerData {
	name: string;
	type: string;
	graph_node_id: CoreGraphNodeId;
	is_dirty: boolean;
	ui_data_json: NodeUIDataJson;
	error_message: string | undefined;
	children: CoreGraphNodeId[];
	inputs: Array<CoreGraphNodeId | undefined>;
	input_connection_output_indices: Array<number | undefined> | undefined;
	named_input_connection_points: BaseConnectionPointData[];
	named_output_connection_points: BaseConnectionPointData[];
	param_ids: CoreGraphNodeId[];
	// spare_params: PolyDictionary<string>;
	override_cloned_state_allowed: boolean;
	inputs_clone_required_states: boolean | boolean[];
	flags?: {
		//has_display: this.has_display_flag()
		display?: boolean;
		bypass?: boolean;
		optimize?: boolean;
	};
	selection?: CoreGraphNodeId[];
}

export class NodeSerializer {
	constructor(private node: BaseNodeType) {}

	// serialize() {
	// 	return this.toJSON();
	// }

	// TODO: find a way to not re-create a json everytime
	toJSON(include_param_components: boolean = false): NodeSerializerData {
		// const spare_params_json_by_name = {};
		// lodash_each(this.node.spare_param_names(), param_name=> {
		// 	const param = this.node.spare_param(param_name);
		// 	spare_params_json_by_name[param_name] = param.graphNodeId();
		// });

		const data = {
			name: this.node.name,
			type: this.node.type,
			graph_node_id: this.node.graphNodeId(),
			is_dirty: this.node.isDirty(),
			ui_data_json: this.node.uiData.toJSON(),
			error_message: this.node.states.error.message(),
			children: this.children_ids(),
			inputs: this.input_ids(),
			input_connection_output_indices: this.input_connection_output_indices(),
			named_input_connection_points: this.named_input_connection_points(),
			named_output_connection_points: this.named_output_connection_points(),
			param_ids: this.to_json_params(include_param_components),
			// spare_params: this.to_json_spare_params(include_param_components),
			override_cloned_state_allowed: this.node.io.inputs.override_cloned_state_allowed(),
			inputs_clone_required_states: this.node.io.inputs.clone_required_states(),
			flags: {
				//has_display: this.has_display_flag()
				display: this.node.flags?.display?.active(),
				bypass: this.node.flags?.bypass?.active(),
				optimize: this.node.flags?.optimize?.active(),
			},
			selection: undefined as CoreGraphNodeId[] | undefined,
		};

		if (this.node.children_allowed() && this.node.children_controller) {
			data['selection'] = this.node.children_controller.selection.toJSON();
		}

		return data;
	}

	children_ids() {
		return this.node.children().map((node) => node.graphNodeId());
	}

	input_ids(): (CoreGraphNodeId | undefined)[] {
		return this.node.io.inputs.inputs().map((node) => (node != null ? node.graphNodeId() : undefined));
	}

	input_connection_output_indices() {
		return this.node.io.connections
			.input_connections()
			?.map((connection) => (connection != null ? connection.output_index : undefined));
	}
	named_input_connection_points() {
		return this.node.io.inputs.named_input_connection_points.map((i) => i.toJSON());
	}
	named_output_connection_points() {
		return this.node.io.outputs.named_output_connection_points.map((o) => o.toJSON());
	}

	to_json_params_from_names(param_names: string[], include_components: boolean = false) {
		return param_names.map((param_name) => {
			return this.node.params.get(param_name)!.graphNodeId();
		});
		// const params_json_by_name: PolyDictionary<string> = {};
		// for (let param_name of param_names) {
		// 	const param = this.node.params.get(param_name);
		// 	if (param) {
		// 		params_json_by_name[param_name] = param.graphNodeId();

		// 		if (include_components && param.is_multiple && param.components) {
		// 			for (let component of param.components) {
		// 				params_json_by_name[component.name] = component.graphNodeId();
		// 			}
		// 		}
		// 	}
		// }
		// return params_json_by_name;
	}
	to_json_params(include_components: boolean = false) {
		return this.to_json_params_from_names(this.node.params.names, include_components);
	}
	// to_json_params_without_components(){
	// 	return this.to_json_params(false)
	// }
	// to_json_params_with_components(){
	// 	return this.to_json_params(true)
	// }
	// to_json_spare_params(include_components: boolean = false) {
	// 	return this.to_json_params_from_names(this.node.params.spare_names, include_components);
	// }
}
