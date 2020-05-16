import {TypedNode} from '../../../nodes/_Base';
import lodash_isString from 'lodash/isString';
import lodash_isBoolean from 'lodash/isBoolean';
import lodash_isObject from 'lodash/isObject';
import lodash_isNumber from 'lodash/isNumber';
import lodash_isArray from 'lodash/isArray';

import {NodeJsonExporterData, NodeJsonExporterUIData, InputData, IoConnectionPointsData} from '../export/Node';
import {ParamJsonExporterData, SimpleParamJsonExporterData, ComplexParamJsonExporterData} from '../export/Param';
import {Vector2} from 'three/src/math/Vector2';
import {JsonImportDispatcher} from './Dispatcher';
import {ParamType} from '../../../poly/ParamType';
import {ParamsUpdateOptions} from '../../../nodes/utils/params/ParamsController';
import {SceneJsonImporter} from '../../..';
import {NodeContext} from '../../../poly/NodeContext';
// import {ParamInitValueSerializedTypeMap} from '../../../params/types/ParamInitValueSerializedTypeMap';
type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export class NodeJsonImporter<T extends BaseNodeTypeWithIO> {
	constructor(protected _node: T) {}

	process_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterData) {
		this.set_connection_points(data['connection_points']);
		this.create_nodes(scene_importer, data['nodes']);
		this.set_selection(data['selection']);

		// inputs clone
		if (this._node.io.inputs.override_cloned_state_allowed()) {
			const override = data['cloned_state_overriden'];
			if (override) {
				this._node.io.inputs.override_cloned_state(override);
			}
		}

		this.set_flags(data);
		this.set_params(data['params']);

		this.from_data_custom(data);

		this._node.lifecycle.set_creation_completed();
	}
	process_inputs_data(data: NodeJsonExporterData) {
		this.set_inputs(data['inputs']);
	}

	process_ui_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterUIData) {
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
		this.process_nodes_ui_data(scene_importer, data['nodes']);
	}

	create_nodes(scene_importer: SceneJsonImporter, data?: Dictionary<NodeJsonExporterData>) {
		if (!data) {
			return;
		}

		const node_names = Object.keys(data);
		const nodes: BaseNodeTypeWithIO[] = [];
		for (let node_name of node_names) {
			const node_data = data[node_name];
			const node_type = node_data['type'];
			if (this._node.children_allowed() && this._node.children_controller) {
				try {
					const node = this._node.create_node(node_type);
					if (node) {
						node.set_name(node_name);
						nodes.push(node);
					}
				} catch (e) {
					scene_importer.report.add_warning(`failed to create node with type '${node_type}'`);
					console.warn('failed to create node with type', node_type, e);
				}
			}
		}
		const importers = [];
		let index = 0;
		for (let node of nodes) {
			const importer = JsonImportDispatcher.dispatch_node(node); //.visit(JsonImporterVisitor)
			importers.push(importer);
			importer.process_data(scene_importer, data[node.name]);
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
		if (this._node.children_allowed() && this._node.children_controller) {
			if (data && data.length > 0) {
				const selected_nodes: BaseNodeTypeWithIO[] = [];
				data.forEach((node_name) => {
					const node = this._node.node(node_name);
					if (node) {
						selected_nodes.push(node);
					}
				});
				this._node.children_controller.selection.set(selected_nodes);
			}
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

	set_connection_points(connection_points_data: IoConnectionPointsData | undefined) {
		if (!connection_points_data) {
			return;
		}
		if (connection_points_data['in']) {
			this._node.io.saved_connection_points_data.set_in(connection_points_data['in']);
		}
		if (connection_points_data['out']) {
			this._node.io.saved_connection_points_data.set_out(connection_points_data['out']);
		}

		if (this._node.io.has_connection_points_controller) {
			this._node.io.connection_points.update_signature_if_required();
		}
	}

	set_inputs(inputs_data?: InputData[]) {
		if (!inputs_data) {
			return;
		}

		let input_data: InputData;
		for (let i = 0; i < inputs_data.length; i++) {
			input_data = inputs_data[i];
			if (input_data && this._node.parent) {
				if (lodash_isString(input_data)) {
					const input_node_name = input_data;
					const input_node = this._node.node_sibbling(input_node_name);
					this._node.set_input(i, input_node);
				} else {
					const input_node = this._node.node_sibbling(input_data['node']);
					const input_index = input_data['index'];
					// if (this._node.io.inputs.has_named_input(input_index)) {
					this._node.set_input(input_index, input_node, input_data['output']);
					// } else {
					// 	console.warn(`${this._node.full_path()} has no input named ${input_name}`);
					// }
				}
			}
		}
	}

	process_nodes_ui_data(scene_importer: SceneJsonImporter, data: Dictionary<NodeJsonExporterUIData>) {
		if (!data) {
			return;
		}

		const node_names = Object.keys(data);
		node_names.forEach((node_name) => {
			const node = this._node.node(node_name);
			if (node) {
				const node_data = data[node_name];
				JsonImportDispatcher.dispatch_node(node).process_ui_data(scene_importer, node_data);
				// node.visit(JsonImporterVisitor).process_ui_data(node_data);
			}
		});
	}

	//
	//
	// PARAMS
	//
	//
	set_params(data?: Dictionary<ParamJsonExporterData<ParamType>>) {
		if (!data) {
			return;
		}
		const param_names = Object.keys(data);

		const params_update_options: ParamsUpdateOptions = {};
		for (let param_name of param_names) {
			const param_data = data[param_name] as ComplexParamJsonExporterData<ParamType>;
			const options = param_data['options'];
			// const is_spare = options && options['spare'] === true;

			const param_type = param_data['type']!;
			const has_param = this._node.params.has_param(param_name);
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
				if (this._is_param_data_complex(param_data)) {
					this._process_param_data_complex(param_name, param_data);
				} else {
					this._process_param_data_simple(param_name, param_data as SimpleParamJsonExporterData<ParamType>);
				}
			} else {
				// it the param is a spare one,
				// we check if it is currently exists with same type first.
				// - if it is, we only update the value
				// - if it's not, we delete it and add it again
				params_update_options.names_to_delete = params_update_options.names_to_delete || [];
				params_update_options.names_to_delete.push(param_name);
				params_update_options.to_add = params_update_options.to_add || [];
				params_update_options.to_add.push({
					name: param_name,
					type: param_type,
					init_value: param_data['default_value'] as any,
					raw_input: param_data['raw_input'] as any,
					options: options,
				});

				// if (options && param_type) {
				// 	if (param_data['default_value']) {
				// 		if (has_param) {
				// 			this._node.params.delete_param(param_name);
				// 		}
				// 		param = this._node.add_param(param_type, param_name, param_data['default_value'], options);
				// 		if (param) {
				// 			JsonImportDispatcher.dispatch_param(param).process_data(param_data);
				// 		}
				// 	}
				// }
			}
		}

		// delete and create the spare params we need to
		const params_delete_required =
			params_update_options.names_to_delete && params_update_options.names_to_delete.length > 0;
		const params_add_required = params_update_options.to_add && params_update_options.to_add.length > 0;

		if (params_delete_required || params_add_required) {
			this._node.params.update_params(params_update_options);
			// update them based on the imported data
			for (let spare_param of this._node.params.spare) {
				const param_data = data[spare_param.name] as ComplexParamJsonExporterData<ParamType>;
				// JsonImportDispatcher.dispatch_param(spare_param).process_data(param_data);
				if (!spare_param.parent_param && param_data) {
					if (this._is_param_data_complex(param_data)) {
						this._process_param_data_complex(spare_param.name, param_data);
					} else {
						this._process_param_data_simple(
							spare_param.name,
							param_data as SimpleParamJsonExporterData<ParamType>
						);
					}
				}
			}
		}
		// those hooks are useful for some gl nodes,
		// such as the constant, which needs to update its connections
		// based on another parameter, which will be set just before
		this._node.params.run_on_scene_load_hooks();
	}

	private _process_param_data_simple(param_name: string, param_data: SimpleParamJsonExporterData<ParamType>) {
		this._node.params.get(param_name)?.set(param_data);
	}

	private _process_param_data_complex(param_name: string, param_data: ComplexParamJsonExporterData<ParamType>) {
		const param = this._node.params.get(param_name);
		if (param) {
			JsonImportDispatcher.dispatch_param(param).process_data(param_data);
		}
		// return
		// const has_param = this._node.params.has_param(param_name);
		// const param_type = param_data['type']!;

		// let has_param_and_same_type = false;
		// let param;
		// if (has_param) {
		// 	param = this._node.params.get(param_name);
		// 	// we can safely consider same type if param_type is not mentioned
		// 	if ((param && param.type == param_type) || param_type == null) {
		// 		has_param_and_same_type = true;
		// 	}
		// }
		// if (has_param_and_same_type) {
		// 	param = this._node.params.get(param_name);
		// 	if (param) {
		// 		JsonImportDispatcher.dispatch_param(param).process_data(param_data);
		// 		// param.visit(JsonImporterVisitor).process_data(param_data);
		// 	}
		// } else {
		// 	const options = param_data['options'];
		// 	if (options && param_type) {
		// 		const is_spare = options['spare'] === true;
		// 		if (is_spare && param_data['default_value']) {
		// 			if (has_param) {
		// 				this._node.params.delete_param(param_name);
		// 			}
		// 			param = this._node.add_param(param_type, param_name, param_data['default_value'], options);
		// 			if (param) {
		// 				JsonImportDispatcher.dispatch_param(param).process_data(param_data);
		// 			}
		// 		}
		// 	}
		// }
	}

	private _is_param_data_complex(param_data: ParamJsonExporterData<ParamType>): boolean {
		// we can test here most param value serialized, except for ramp
		if (
			lodash_isString(param_data) ||
			lodash_isNumber(param_data) ||
			lodash_isArray(param_data) ||
			lodash_isBoolean(param_data)
		) {
			return false;
		}

		if (lodash_isObject(param_data)) {
			if (Object.keys(param_data).includes('type')) {
				return true;
			}
		}

		return false;
	}

	from_data_custom(data: NodeJsonExporterData) {}
}
