import {TypedNode} from '../../../nodes/_Base';
import {SceneJsonExporter} from './Scene';
import {NodeContext} from '../../../poly/NodeContext';
import {JsonExportDispatcher} from './Dispatcher';
import {ParamJsonExporterData} from '../../../nodes/utils/io/IOController';
import {ParamType} from '../../../poly/ParamType';
import {BaseConnectionPointData} from '../../../nodes/utils/io/connections/_Base';

// revert to using index instead of name
// for gl nodes such as the if node, whose input names
// changes depending on the input
interface NamedInputData {
	index: number;
	node: string;
	output: string;
}
type IndexedInputData = string | null;
export type InputData = NamedInputData | IndexedInputData;

interface FlagsData {
	bypass?: boolean;
	display?: boolean;
	optimize?: boolean;
}
export interface IoConnectionPointsData {
	in?: BaseConnectionPointData[];
	out?: BaseConnectionPointData[];
}

export interface NodeJsonExporterData {
	type: string;
	nodes?: Dictionary<NodeJsonExporterData>;
	children_context?: NodeContext;
	params?: Dictionary<ParamJsonExporterData<ParamType>>;
	inputs?: InputData[];
	connection_points?: IoConnectionPointsData;
	selection?: string[];
	flags?: FlagsData;
	cloned_state_overriden?: boolean;
	persisted_config?: object;
}

export interface NodeJsonExporterUIData {
	pos?: Number2;
	comment?: string;
	nodes: Dictionary<NodeJsonExporterUIData>;
}

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;

export class NodeJsonExporter<T extends BaseNodeTypeWithIO> {
	private _data: NodeJsonExporterData | undefined; // = {} as NodeJsonExporterData;
	constructor(protected _node: T) {}

	data(): NodeJsonExporterData {
		if (!this.is_root()) {
			this._node.scene.nodes_controller.register_node_context_signature(this._node);
		}
		this._data = {
			type: this._node.type,
		} as NodeJsonExporterData;

		// const required_imports = this._node.required_imports()
		// if(required_imports){
		// 	this._data['required_imports'] = required_imports
		// }

		const nodes_data = this.nodes_data();
		if (Object.keys(nodes_data).length > 0) {
			this._data['nodes'] = nodes_data;

			// required by the Store::Scene::Exporter.rb
			// Update: removed as there should be a better way
			// const context = this._node.children_controller?.context;
			// if (context) {
			// 	this._data['children_context'] = context;
			// }
		}

		if (!this.is_root()) {
			const params_data = this.params_data();
			if (Object.keys(params_data).length > 0) {
				this._data['params'] = params_data;
			}
			//data['custom'] = []
			const inputs_data = this.inputs_data();
			if (inputs_data.length > 0) {
				this._data['inputs'] = inputs_data;
			}
			const connection_points_data = this.connection_points_data();
			if (connection_points_data) {
				this._data['connection_points'] = connection_points_data;
			}
		}

		if (this._node.flags) {
			const flags_data: FlagsData = {};
			if (this._node.flags.has_bypass() || this._node.flags.has_display() || this._node.flags.has_optimize()) {
				if (this._node.flags.has_bypass()) {
					if (this._node.flags.bypass?.active) {
						flags_data['bypass'] = this._node.flags.bypass.active;
					}
				}
				if (this._node.flags.has_display()) {
					// only save the display flag if it is true, or if the parent does not have a display_node_controller
					// This will then always save it for OBJ
					// And only if true for SOP
					if (this._node.flags.display?.active || !this._node.parent?.display_node_controller) {
						flags_data['display'] = this._node.flags.display?.active;
					}
				}
				if (this._node.flags.has_optimize()) {
					if (this._node.flags.optimize?.active) {
						flags_data['optimize'] = this._node.flags.optimize?.active;
					}
				}
			}
			if (Object.keys(flags_data).length > 0) {
				this._data['flags'] = flags_data;
			}
		}

		if (this._node.children_allowed()) {
			const selection = this._node.children_controller?.selection;
			if (selection && this._node.children().length > 0) {
				// only save the nodes that are still present, in case the selection just got deleted
				const selected_children: BaseNodeTypeWithIO[] = [];
				const selected_ids: Dictionary<boolean> = {};
				for (let selected_node of selection.nodes()) {
					selected_ids[selected_node.graph_node_id] = true;
				}
				for (let child of this._node.children()) {
					if (child.graph_node_id in selected_ids) {
						selected_children.push(child);
					}
				}
				const selection_data = selected_children.map((n) => n.name);
				if (selection_data.length > 0) {
					this._data['selection'] = selection_data;
				}
			}
		}

		// inputs clone
		if (this._node.io.inputs.override_cloned_state_allowed()) {
			const overriden = this._node.io.inputs.cloned_state_overriden();
			if (overriden) {
				this._data['cloned_state_overriden'] = overriden;
			}
		}

		// persisted config
		if (this._node.persisted_config) {
			const persisted_config_data = this._node.persisted_config.to_json();
			if (persisted_config_data) {
				this._data.persisted_config = persisted_config_data;
			}
		}

		// custom
		this.add_custom();

		return this._data;
	}

	ui_data(): NodeJsonExporterUIData {
		const data: NodeJsonExporterUIData = {} as NodeJsonExporterUIData;
		if (!this.is_root()) {
			const ui_data = this._node.uiData;
			data['pos'] = ui_data.position.toArray() as Number2;
			const comment = ui_data.comment;
			if (comment) {
				data['comment'] = SceneJsonExporter.sanitize_string(comment);
			}
		}
		const children = this._node.children();
		if (children.length > 0) {
			data['nodes'] = {};
			children.forEach((child) => {
				const node_exporter = JsonExportDispatcher.dispatch_node(child); //.visit(JsonExporterVisitor); //.json_exporter()
				data['nodes'][child.name] = node_exporter.ui_data();
			});
		}

		return data;
	}

	private is_root() {
		return this._node.parent === null && this._node.graph_node_id == this._node.root.graph_node_id;
	}

	protected inputs_data() {
		const data: InputData[] = [];
		this._node.io.inputs.inputs().forEach((input, input_index) => {
			if (input) {
				const connection = this._node.io.connections.input_connection(input_index)!;
				if (this._node.io.inputs.has_named_inputs) {
					// const input_name = this._node.io.inputs.named_input_connection_points[input_index].name;
					const output_index = connection.output_index;
					const output_name = input.io.outputs.named_output_connection_points[output_index]?.name;
					if (output_name) {
						data[input_index] = {
							index: input_index,
							node: input.name,
							output: output_name,
						};
					}
				} else {
					data[input_index] = input.name;
				}
			}
		});

		return data;
	}

	protected connection_points_data() {
		if (!this._node.io.has_connection_points_controller) {
			return;
		}
		if (!this._node.io.connection_points.initialized()) {
			return;
		}

		if (this._node.io.inputs.has_named_inputs || this._node.io.outputs.has_named_outputs) {
			const data: IoConnectionPointsData = {};
			if (this._node.io.inputs.has_named_inputs) {
				data['in'] = [];
				for (let cp of this._node.io.inputs.named_input_connection_points) {
					if (cp) {
						data['in'].push(cp.to_json());
					}
				}
			}
			if (this._node.io.outputs.has_named_outputs) {
				data['out'] = [];
				for (let cp of this._node.io.outputs.named_output_connection_points) {
					if (cp) {
						data['out'].push(cp.to_json());
					}
				}
			}
			return data;
		}
	}

	protected params_data() {
		const data: Dictionary<ParamJsonExporterData<ParamType>> = {};

		for (let param_name of this._node.params.names) {
			const param = this._node.params.get(param_name);
			if (param && !param.parent_param) {
				const param_exporter = JsonExportDispatcher.dispatch_param(param);
				if (param_exporter.required) {
					const params_data = param_exporter.data();
					data[param.name] = params_data;
				}
			}
		}

		return data;
	}

	protected nodes_data() {
		const data: Dictionary<NodeJsonExporterData> = {};
		for (let child of this._node.children()) {
			const node_exporter = JsonExportDispatcher.dispatch_node(child); //.json_exporter()
			data[child.name] = node_exporter.data();
		}
		return data;
	}

	protected add_custom() {}
}
