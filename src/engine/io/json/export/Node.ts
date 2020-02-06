import {BaseNodeType} from 'src/engine/nodes/_Base';
import {SceneJsonExporter} from './Scene';
// import {JsonExporterVisitor} from './Visitor';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {JsonExportDispatcher} from './Dispatcher';
import {ParamJsonExporterData} from './Param';

interface NamedInputData {
	name: string;
	node: string;
	output: string;
}
type IndexedInputData = string | null;
export type InputData = NamedInputData | IndexedInputData;

interface FlagsData {
	bypass?: boolean;
	display?: boolean;
}

export interface NodeJsonExporterData {
	type: string;
	nodes: Dictionary<NodeJsonExporterData>;
	children_context: NodeContext;
	params?: Dictionary<ParamJsonExporterData>;
	inputs?: InputData[];
	selection?: string[];
	flags?: FlagsData;
	override_clonable_state: boolean;
}

export interface NodeJsonExporterUIData {
	pos?: Number2;
	comment?: string;
	nodes: Dictionary<NodeJsonExporterUIData>;
}

export class NodeJsonExporter<T extends BaseNodeType> {
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
			const context = this._node.children_controller?.context;
			if (context) {
				this._data['children_context'] = context;
			}
		}

		if (!this.is_root()) {
			this._data['params'] = this.params_data();
			//data['custom'] = []
			this._data['inputs'] = this.inputs_data();
		}

		// TODO: does that create flags automatically? it should not
		if (this._node.flags) {
			this._data['flags'] = {};
			if (this._node.flags.has_bypass()) {
				if (this._node.flags.bypass?.active) {
					this._data['flags']['bypass'] = this._node.flags.bypass.active;
				}
			}
			if (this._node.flags.has_display()) {
				this._data['flags']['display'] = this._node.flags.display?.active;
			}
		}

		if (this._node.children_allowed()) {
			const selection = this._node.children_controller?.selection;
			if (selection && this._node.children().length > 0) {
				// only save the nodes that are still present, in case the selection just got deleted
				const selected_children: BaseNodeType[] = [];
				const selected_ids: Dictionary<boolean> = {};
				for (let selected_node of selection.nodes()) {
					selected_ids[selected_node.graph_node_id] = true;
				}
				for (let child of this._node.children()) {
					if (child.graph_node_id in selected_ids) {
						selected_children.push(child);
					}
				}
				this._data['selection'] = selected_children.map((n) => n.name);
			}
		}

		// inputs clone
		if (this._node.io.inputs.override_clonable_state_allowed()) {
			const override = this._node.io.inputs.override_clonable_state();
			if (override) {
				this._data['override_clonable_state'] = override;
			}
		}

		// custom
		this.add_custom();

		return this._data;
	}

	ui_data(): NodeJsonExporterUIData {
		const data: NodeJsonExporterUIData = {} as NodeJsonExporterUIData;
		if (!this.is_root()) {
			const ui_data = this._node.ui_data;
			data['pos'] = ui_data.position().toArray() as Number2;
			const comment = ui_data.comment();
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
		// Object.keys(this._node.io.inputs.inputs()).forEach((input_index) => {
		this._node.io.inputs.inputs().forEach((input, input_index) => {
			// const input = this._node.io.inputs.input(input_index);
			if (input) {
				// const connection_point = this._node.io.inputs.named_input_connection_points;
				const connection = this._node.io.connections.input_connection(input_index)!;
				if (this._node.io.inputs.has_named_inputs) {
					const input_name = this._node.io.inputs.named_input_connection_points[input_index].name;
					// const output_index = input_connections[input_index].output_index();
					const output_index = connection.output_index;
					const output_name = input.io.inputs.named_input_connection_points[output_index].name;
					data.push({name: input_name, node: input.name, output: output_name});
				} else {
					data.push(input ? input.name : null);
				}
			}
		});

		return data;
	}

	protected params_data() {
		const data: Dictionary<ParamJsonExporterData> = {};

		for (let param_name of this._node.params.names) {
			const param = this._node.params.get(param_name);
			if (param) {
				const param_exporter = JsonExportDispatcher.dispatch_param(param); //.visit(JsonExporterVisitor); //.json_exporter()
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
