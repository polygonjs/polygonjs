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
	maxInputsCount: number;
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
	polyNode?: {
		locked: boolean;
	};
}

export class NodeSerializer {
	constructor(private node: BaseNodeType) {}

	dispose() {}

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

		const data: NodeSerializerData = {
			name: this.node.name(),
			type: this.node.type(),
			graph_node_id: this.node.graphNodeId(),
			is_dirty: this.node.isDirty(),
			ui_data_json: this.node.uiData.toJSON(),
			error_message: this.node.states.error.message(),
			children: this.childrenIds(),
			maxInputsCount: this.maxInputsCount(),
			inputs: this.inputIds(),
			input_connection_output_indices: this.inputConnectionOutputIndices(),
			named_input_connection_points: this.namedInputConnectionPoints(),
			named_output_connection_points: this.namedOutputConnectionPoints(),
			param_ids: this.to_json_params(include_param_components),
			// spare_params: this.to_json_spare_params(include_param_components),
			override_cloned_state_allowed: this.node.io.inputs.overrideClonedStateAllowed(),
			inputs_clone_required_states: this.node.io.inputs.cloneRequiredStates(),
			flags: {
				//has_display: this.has_display_flag()
				display: this.node.flags?.display?.active(),
				bypass: this.node.flags?.bypass?.active(),
				optimize: this.node.flags?.optimize?.active(),
			},
			selection: undefined as CoreGraphNodeId[] | undefined,
		};

		if (this.node.childrenAllowed() && this.node.childrenController) {
			data['selection'] = this.node.childrenController.selection.toJSON();
		}
		if (this.node.polyNodeController) {
			data['polyNode'] = {
				locked: this.node.polyNodeController.locked(),
			};
		}

		return data;
	}

	childrenIds() {
		return this.node.children().map((node) => node.graphNodeId());
	}

	maxInputsCount() {
		return this.node.io.inputs.maxInputsCount();
	}

	inputIds(): (CoreGraphNodeId | undefined)[] {
		return this.node.io.inputs.inputs().map((node) => (node != null ? node.graphNodeId() : undefined));
	}

	inputConnectionOutputIndices() {
		return this.node.io.connections
			.inputConnections()
			?.map((connection) => (connection != null ? connection.output_index : undefined));
	}
	namedInputConnectionPoints() {
		return this.node.io.inputs.namedInputConnectionPoints().map((i) => i.toJSON());
	}
	namedOutputConnectionPoints() {
		return this.node.io.outputs.namedOutputConnectionPoints().map((o) => o.toJSON());
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

		// 		if (include_components && param.isMultiple() && param.components) {
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
