import {Number2, PolyDictionary} from '../../../../types/GlobalTypes';
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
	nodes?: PolyDictionary<NodeJsonExporterData>;
	children_context?: NodeContext;
	params?: PolyDictionary<ParamJsonExporterData<ParamType>>;
	maxInputsCount?: number;
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
	nodes: PolyDictionary<NodeJsonExporterUIData>;
}

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;

export interface DataRequestOption {
	showPolyNodesData?: boolean;
}

export class NodeJsonExporter<T extends BaseNodeTypeWithIO> {
	private _data: NodeJsonExporterData | undefined; // = {} as NodeJsonExporterData;
	constructor(protected _node: T) {}

	data(options: DataRequestOption = {}): NodeJsonExporterData {
		if (!this.is_root()) {
			this._node.scene().nodesController.register_node_context_signature(this._node);
		}
		this._data = {
			type: this._node.type(),
		} as NodeJsonExporterData;

		// const required_imports = this._node.required_imports()
		// if(required_imports){
		// 	this._data['required_imports'] = required_imports
		// }

		const nodes_data = this.nodes_data(options);
		if (Object.keys(nodes_data).length > 0) {
			this._data['nodes'] = nodes_data;

			// required by the Store::Scene::Exporter.rb
			// Update: removed as there should be a better way
			// const context = this._node.childrenController?.context;
			// if (context) {
			// 	this._data['children_context'] = context;
			// }
		}

		const params_data = this.params_data();
		if (Object.keys(params_data).length > 0) {
			this._data['params'] = params_data;
		}
		if (!this.is_root()) {
			//data['custom'] = []
			if (this._node.io.inputs.maxInputsCountOverriden()) {
				this._data['maxInputsCount'] = this._node.io.inputs.maxInputsCount();
			}

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
			if (this._node.flags.hasBypass() || this._node.flags.hasDisplay() || this._node.flags.hasOptimize()) {
				if (this._node.flags.hasBypass()) {
					if (this._node.flags.bypass?.active()) {
						flags_data['bypass'] = this._node.flags.bypass.active();
					}
				}
				if (this._node.flags.hasDisplay()) {
					// only save the display flag if it is true, or if the parent does not have a displayNodeController
					// This will then always save it for OBJ
					// And only if true for SOP
					if (this._node.flags.display?.active() || !this._node.parent()?.displayNodeController) {
						flags_data['display'] = this._node.flags.display?.active();
					}
				}
				if (this._node.flags.hasOptimize()) {
					if (this._node.flags.optimize?.active()) {
						flags_data['optimize'] = this._node.flags.optimize?.active();
					}
				}
			}
			if (Object.keys(flags_data).length > 0) {
				this._data['flags'] = flags_data;
			}
		}

		if (this._node.childrenAllowed()) {
			const selection = this._node.childrenController?.selection;
			if (selection && this._node.children().length > 0) {
				// only save the nodes that are still present, in case the selection just got deleted
				const selected_children: BaseNodeTypeWithIO[] = [];
				const selected_ids: PolyDictionary<boolean> = {};
				for (let selected_node of selection.nodes()) {
					selected_ids[selected_node.graphNodeId()] = true;
				}
				for (let child of this._node.children()) {
					if (child.graphNodeId() in selected_ids) {
						selected_children.push(child);
					}
				}
				const selection_data = selected_children.map((n) => n.name());
				if (selection_data.length > 0) {
					this._data['selection'] = selection_data;
				}
			}
		}

		// inputs clone
		if (this._node.io.inputs.overrideClonedStateAllowed()) {
			const overriden = this._node.io.inputs.clonedStateOverriden();
			if (overriden) {
				this._data['cloned_state_overriden'] = overriden;
			}
		}

		// persisted config
		if (this._node.persisted_config) {
			const persisted_config_data = this._node.persisted_config.toJSON();
			if (persisted_config_data) {
				this._data.persisted_config = persisted_config_data;
			}
		}

		// custom
		this.add_custom();

		return this._data;
	}

	uiData(options: DataRequestOption = {}): NodeJsonExporterUIData {
		const data: NodeJsonExporterUIData = this.ui_data_without_children();
		const children = this._node.children();
		if (children.length > 0) {
			data['nodes'] = {};
			children.forEach((child) => {
				const node_exporter = JsonExportDispatcher.dispatch_node(child); //.visit(JsonExporterVisitor); //.json_exporter()
				data['nodes'][child.name()] = node_exporter.uiData(options);
			});
		}

		return data;
	}
	protected ui_data_without_children(): NodeJsonExporterUIData {
		const data: NodeJsonExporterUIData = {} as NodeJsonExporterUIData;
		if (!this.is_root()) {
			const ui_data = this._node.uiData;
			data['pos'] = ui_data.position().toArray() as Number2;
			const comment = ui_data.comment();
			if (comment) {
				data['comment'] = SceneJsonExporter.sanitize_string(comment);
			}
		}
		return data;
	}

	private is_root() {
		return this._node.parent() === null && this._node.graphNodeId() == this._node.root().graphNodeId();
	}

	protected inputs_data() {
		const data: InputData[] = [];
		this._node.io.inputs.inputs().forEach((input, input_index) => {
			if (input) {
				const connection = this._node.io.connections.inputConnection(input_index)!;
				if (this._node.io.inputs.hasNamedInputs()) {
					// const input_name = this._node.io.inputs.namedInputConnectionPoints()[input_index].name;
					const output_index = connection.output_index;
					const output_name = input.io.outputs.namedOutputConnectionPoints()[output_index]?.name();
					if (output_name) {
						data[input_index] = {
							index: input_index,
							node: input.name(),
							output: output_name,
						};
					}
				} else {
					data[input_index] = input.name();
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

		if (this._node.io.inputs.hasNamedInputs() || this._node.io.outputs.hasNamedOutputs()) {
			const data: IoConnectionPointsData = {};
			if (this._node.io.inputs.hasNamedInputs()) {
				data['in'] = [];
				for (let cp of this._node.io.inputs.namedInputConnectionPoints()) {
					if (cp) {
						data['in'].push(cp.toJSON());
					}
				}
			}
			if (this._node.io.outputs.hasNamedOutputs()) {
				data['out'] = [];
				for (let cp of this._node.io.outputs.namedOutputConnectionPoints()) {
					if (cp) {
						data['out'].push(cp.toJSON());
					}
				}
			}
			return data;
		}
	}

	protected params_data() {
		const data: PolyDictionary<ParamJsonExporterData<ParamType>> = {};

		for (let param_name of this._node.params.names) {
			const param = this._node.params.get(param_name);
			if (param && !param.parentParam()) {
				const param_exporter = JsonExportDispatcher.dispatch_param(param);
				if (param_exporter.required()) {
					const params_data = param_exporter.data();
					data[param.name()] = params_data;
				}
			}
		}

		return data;
	}

	protected nodes_data(options: DataRequestOption = {}) {
		const data: PolyDictionary<NodeJsonExporterData> = {};
		for (let child of this._node.children()) {
			const node_exporter = JsonExportDispatcher.dispatch_node(child); //.json_exporter()
			data[child.name()] = node_exporter.data(options);
		}
		return data;
	}

	protected add_custom() {}
}
