import {BaseNodeType} from 'src/engine/nodes/_Base';
import lodash_isString from 'lodash/isString';

import {NodeJsonExporterData, NodeJsonExporterUIData, InputData} from '../export/Node';
import {ParamJsonExporterData} from '../export/Param';
import {Vector2} from 'three/src/math/Vector2';
import {JsonImportDispatcher} from './Dispatcher';

export class NodeJsonImporter<T extends BaseNodeType> {
	constructor(protected _node: T) {}

	process_data(data: NodeJsonExporterData) {
		this.create_nodes(data['nodes']);
		this.set_selection(data['selection']);

		// inputs clone
		if (this._node.io.inputs.override_clonable_state_allowed()) {
			const override = data['override_clonable_state'];
			if (override) {
				this._node.io.inputs.set_override_clonable_state(override);
			}
		}

		this.set_flags(data);
		this.set_params(data['params']);

		this.from_data_custom(data);
	}
	process_inputs_data(data: NodeJsonExporterData) {
		this.set_inputs(data['inputs']);
	}

	process_ui_data(data: NodeJsonExporterUIData) {
		if (!data) {
			return;
		}
		const ui_data = this._node.ui_data;
		const pos = data['pos'];
		if (pos) {
			const vector = new Vector2().fromArray(pos);
			ui_data.set_position(vector);
		}
		const comment = data['comment'];
		if (comment) {
			ui_data.set_comment(comment);
		}
		this.process_nodes_ui_data(data['nodes']);
	}

	create_nodes(data?: Dictionary<NodeJsonExporterData>) {
		if (!data) {
			return;
		}

		const node_names = Object.keys(data);
		const nodes = [];
		for (let node_name of node_names) {
			const node_data = data[node_name];
			const node_type = node_data['type'];
			const node = this._node.create_node(node_type);
			node.set_name(node_name);
			nodes.push(node);
		}
		const importers = [];
		let index = 0;
		for (let node of nodes) {
			const importer = JsonImportDispatcher.dispatch_node(node); //.visit(JsonImporterVisitor)
			importers.push(importer);
			importer.process_data(data[node.name]);
			index++;
		}
		index = 0;
		for (let node of nodes) {
			const importer = importers[index];
			importer.process_inputs_data(data[node.name]);
			index++;
		}
	}
	set_selection(data?: string[]) {
		if (data && data.length > 0) {
			const selected_nodes: BaseNodeType[] = [];
			data.forEach((node_name) => {
				const node = this._node.node(node_name);
				if (node) {
					selected_nodes.push(node);
				}
			});
			this._node.selection.set(selected_nodes);
		}
	}

	set_flags(data: NodeJsonExporterData) {
		const flags = data['flags'];
		if (flags) {
			const bypass = flags['bypass'];
			if (bypass != null) {
				this._node.flags?.bypass?.set(bypass);
			}
			const display = flags['display'];
			if (display != null) {
				this._node.flags?.display?.set(display);
			}
		}
	}

	set_inputs(inputs_data?: InputData[]) {
		if (!inputs_data) {
			return;
		}

		inputs_data.forEach((input_data, i) => {
			if (input_data && this._node.parent) {
				if (lodash_isString(input_data)) {
					const input_node_name = input_data;
					const input_node = this._node.parent.node(input_node_name);
					this._node.set_input(i, input_node);
				} else {
					const input_node = this._node.parent.node(input_data['node']);
					const input_name = input_data['name'];
					if (this._node.io.inputs.has_named_input(input_name)) {
						this._node.set_input(input_data['name'], input_node, input_data['output']);
					} else {
						console.warn(`${this._node.full_path()} has no input named ${input_name}`);
					}
				}
			}
		});
	}

	process_nodes_ui_data(data: Dictionary<NodeJsonExporterUIData>) {
		if (!data) {
			return;
		}

		const node_names = Object.keys(data);
		node_names.forEach((node_name) => {
			const node = this._node.node(node_name);
			if (node) {
				const node_data = data[node_name];
				JsonImportDispatcher.dispatch_node(node).process_ui_data(node_data);
				// node.visit(JsonImporterVisitor).process_ui_data(node_data);
			}
		});
	}

	set_params(data?: Dictionary<ParamJsonExporterData>) {
		if (!data) {
			return;
		}

		const param_names = Object.keys(data);

		param_names.forEach((param_name) => {
			const param_data = data[param_name];
			const has_param = this._node.params.has_param(param_name);
			const param_type = param_data['type'];
			if (!param_type) {
				return;
			}

			let has_param_and_same_type = false;
			let param;
			if (has_param) {
				param = this._node.params.get(param_name);
				// we can safely consider same type if param_type is not mentioned
				if ((param && param.type == param_type) || param_type == null) {
					has_param_and_same_type = true;
				}
			}
			if (has_param_and_same_type) {
				param = this._node.params.get(param_name);
				if (param) {
					JsonImportDispatcher.dispatch_param(param).process_data(param_data);
					// param.visit(JsonImporterVisitor).process_data(param_data);
				}
			} else {
				const options = param_data['options'];
				if (options) {
					const is_spare = options['spare'] === true;
					if (is_spare && param_data['default_value']) {
						if (has_param) {
							this._node.params.delete_param(param_name);
						}
						param = this._node.add_param(param_type, param_name, param_data['default_value'], options);
						if (param) {
							JsonImportDispatcher.dispatch_param(param).process_data(param_data);
						}
					}
				}
			}
		});
	}

	from_data_custom(data: NodeJsonExporterData) {}
}
