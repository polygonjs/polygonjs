import {TypedNode, BaseNodeType} from '../../../nodes/_Base';
import {JsonImportDispatcher} from './Dispatcher';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeContext} from '../../../poly/NodeContext';
import {NodeJsonExporterData} from '../export/Node';
import lodash_isString from 'lodash/isString';
import {ParamJsonImporter} from './Param';
import {PolyNodeJsonImporter} from './nodes/Poly';
import {Poly} from '../../../Poly';
import {NodeJsonImporter} from './Node';
import {OperationsStackSopNode} from '../../../nodes/sop/OperationsStack';
import {SopOperationContainer} from '../../../../core/operation/sop/_Base';
import {OPERATIONS_STACK_NODE_TYPE} from '../../../../core/operation/_Base';

export const COMPLEX_PARAM_DATA_KEYS = ['overriden_options', 'type'];

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export class NodesJsonImporter<T extends BaseNodeTypeWithIO> {
	constructor(protected _node: T) {}

	process_data(scene_importer: SceneJsonImporter, data?: Dictionary<NodeJsonExporterData>) {
		if (!data) {
			return;
		}
		if (!(this._node.children_allowed() && this._node.children_controller)) {
			return;
		}

		const {optimized_names, non_optimized_names} = this._child_names_by_optimized_state(data);
		const nodes: BaseNodeTypeWithIO[] = [];
		for (let node_name of non_optimized_names) {
			const node_data = data[node_name];
			let node_type = node_data['type'];
			const non_spare_params_data = ParamJsonImporter.non_spare_params_data_value(node_data['params']);

			try {
				const node = this._node.create_node(node_type, non_spare_params_data);
				if (node) {
					node.set_name(node_name);
					nodes.push(node);
				}
			} catch (e) {
				scene_importer.report.add_warning(`failed to create node with type '${node_type}'`);
				Poly.warn('failed to create node with type', node_type, e);
			}
		}

		for (let node_name of optimized_names) {
			const tmp_node_data = data[node_name];
			if (this._is_optimized_root_node(data, node_name, tmp_node_data)) {
				const optimized_node_names = this._optimized_names_for_root(data, node_name, tmp_node_data);
				optimized_node_names.reverse();
				const node = this._node.create_node(OPERATIONS_STACK_NODE_TYPE);
				if (node) {
					node.set_name(node_name);
					nodes.push(node);
				}

				for (let optimized_node_name of optimized_node_names) {
					const optimized_node_data = data[optimized_node_name];
					let node_type = optimized_node_data['type'];
					const non_spare_params_data = ParamJsonImporter.non_spare_params_data_value(
						optimized_node_data['params']
					);

					if (this._is_node_bypassed(optimized_node_data)) {
						node_type = 'null';
					}
					const operation_container = this._node.create_operation_container(node_type, non_spare_params_data);
					if (operation_container) {
						(node as OperationsStackSopNode).add_operation(operation_container as SopOperationContainer);
					}
				}

				// TODO: the node inputs are currently set from the last optimized_node_names.
				// But this would only work for nodes with only 1 input, not more.
				const last_optimized_node_name = optimized_node_names[0];
				const last_optimized_node_data = data[last_optimized_node_name];

				tmp_node_data['inputs'] = last_optimized_node_data['inputs'];
			}
		}

		const importers_by_node_name: Map<string, PolyNodeJsonImporter | NodeJsonImporter<BaseNodeType>> = new Map();
		for (let node of nodes) {
			const child_data = data[node.name];
			if (child_data) {
				const importer = JsonImportDispatcher.dispatch_node(node);
				importers_by_node_name.set(node.name, importer);
				importer.process_data(scene_importer, data[node.name]);
			} else {
				Poly.warn(`possible import error for node ${node.name}`);
			}
		}
		for (let node of nodes) {
			const importer = importers_by_node_name.get(node.name);
			if (importer) {
				importer.process_inputs_data(data[node.name]);
			}
		}
	}

	private _child_names_by_optimized_state(data: Dictionary<NodeJsonExporterData>) {
		const node_names = Object.keys(data);
		const optimized_names: string[] = [];
		const non_optimized_names: string[] = [];
		for (let node_name of node_names) {
			const node_data = data[node_name];
			const optimized_state = Poly.instance().player_mode() && this._is_node_optimized(node_data);
			if (optimized_state) {
				optimized_names.push(node_name);
			} else {
				non_optimized_names.push(node_name);
			}
		}
		return {optimized_names, non_optimized_names};
	}

	private _optimized_names_for_root(
		data: Dictionary<NodeJsonExporterData>,
		current_node_name: string,
		current_node_data: NodeJsonExporterData,
		input_names: string[] = []
	) {
		input_names.push(current_node_name);
		const inputs = current_node_data['inputs'];
		if (inputs) {
			for (let input_data of inputs) {
				if (lodash_isString(input_data)) {
					const input_node_name = input_data;
					// if (input_node_name != current_node_name) {
					const input_node_data = data[input_node_name];

					if (input_node_data) {
						if (
							this._is_node_optimized(input_node_data) &&
							!this._is_optimized_root_node(data, input_node_name, input_node_data)
						) {
							this._optimized_names_for_root(data, input_node_name, input_node_data, input_names);
						}
					}
					// }
				}
			}
		}
		return input_names;
	}

	// a node will be considered optimized root node if:
	// - it has no output
	// - at least one output is not optimized (as it if it has 2 outputs, and only 1 is optimized, it will not be considered root)
	private _is_optimized_root_node(
		data: Dictionary<NodeJsonExporterData>,
		current_node_name: string,
		current_node_data: NodeJsonExporterData
	) {
		const output_names = this._node_outputs(data, current_node_name, current_node_data);

		if (output_names.size == 0) {
			return true;
		}

		let non_optimized_count = 0;
		output_names.forEach((node_name) => {
			const node_data = data[node_name];
			if (this._is_node_optimized(node_data)) {
			} else {
				non_optimized_count++;
			}
		});
		if (non_optimized_count > 0) {
			return true;
		}
		return false;
	}
	private _node_outputs(
		data: Dictionary<NodeJsonExporterData>,
		current_node_name: string,
		current_node_data: NodeJsonExporterData
	) {
		const node_names = Object.keys(data);
		const output_node_names: Set<string> = new Set();
		for (let node_name of node_names) {
			if (node_name != current_node_name) {
				const node_data = data[node_name];
				const inputs = node_data['inputs'];
				if (inputs) {
					for (let input_data of inputs) {
						if (lodash_isString(input_data)) {
							const input_node_name = input_data;
							if (input_node_name == current_node_name) {
								output_node_names.add(node_name);
							}
						}
					}
				}
			}
		}
		return output_node_names;
	}

	private _is_node_optimized(node_data: NodeJsonExporterData) {
		const node_flags = node_data['flags'];
		if (node_flags && node_flags['optimize']) {
			return true;
		}
		return false;
	}
	private _is_node_bypassed(node_data: NodeJsonExporterData) {
		const node_flags = node_data['flags'];
		if (node_flags && node_flags['bypass']) {
			return true;
		}
		return false;
	}
}
