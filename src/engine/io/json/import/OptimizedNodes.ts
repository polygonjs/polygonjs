import {TypedNode, BaseNodeType} from '../../../nodes/_Base';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeContext} from '../../../poly/NodeContext';
import {NodeJsonExporterData} from '../export/Node';
import {ParamJsonImporter} from './Param';
import {Poly} from '../../../Poly';
import {OperationsComposerSopNode} from '../../../nodes/sop/OperationsComposer';
import {SopOperationContainer} from '../../../../core/operations/container/sop';
import {OPERATIONS_COMPOSER_NODE_TYPE} from '../../../../core/operations/_Base';
import {CoreType} from '../../../../core/Type';
import {PolyDictionary} from '../../../../types/GlobalTypes';

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;

interface RootNodeGenericData {
	outputs_count: number;
	non_optimized_count: number;
}

export class OptimizedNodesJsonImporter<T extends BaseNodeTypeWithIO> {
	constructor(protected _node: T) {}

	private _nodes: BaseNodeTypeWithIO[] = [];
	private _optimized_root_node_names: Set<string> = new Set();
	private _operation_containers_by_name: Map<string, SopOperationContainer> = new Map();
	nodes() {
		return this._nodes;
	}

	process_data(scene_importer: SceneJsonImporter, data?: PolyDictionary<NodeJsonExporterData>) {
		if (!data) {
			return;
		}
		if (!(this._node.children_allowed() && this._node.children_controller)) {
			return;
		}

		const {optimized_names} = OptimizedNodesJsonImporter.child_names_by_optimized_state(data);

		this._nodes = [];
		this._optimized_root_node_names = new Set();
		for (let node_name of optimized_names) {
			if (OptimizedNodesJsonImporter.is_optimized_root_node(data, node_name)) {
				this._optimized_root_node_names.add(node_name);
			}
		}

		for (let node_name of this._optimized_root_node_names) {
			const node_data = data[node_name];
			const node = this._node.createNode(OPERATIONS_COMPOSER_NODE_TYPE);
			if (node) {
				node.setName(node_name);
				this._nodes.push(node);

				// ensure the display flag is set accordingly
				if (node_data.flags?.display) {
					node.flags?.display?.set(true);
				}
				const operation_container = this._create_operation_container(
					scene_importer,
					node as OperationsComposerSopNode,
					node_data,
					node.name
				);
				(node as OperationsComposerSopNode).set_output_operation_container(
					operation_container as SopOperationContainer
				);
			}
		}

		for (let node of this._nodes) {
			const operation_container = (node as OperationsComposerSopNode).output_operation_container();
			if (operation_container) {
				this._node_inputs = [];
				this._add_optimized_node_inputs(
					scene_importer,
					node as OperationsComposerSopNode,
					data,
					node.name,
					operation_container
				);
				node.io.inputs.set_count(this._node_inputs.length);
				for (let i = 0; i < this._node_inputs.length; i++) {
					node.setInput(i, this._node_inputs[i]);
				}
			}
		}
	}

	private _node_inputs: BaseNodeType[] = [];
	private _add_optimized_node_inputs(
		scene_importer: SceneJsonImporter,
		node: OperationsComposerSopNode,
		data: PolyDictionary<NodeJsonExporterData>,
		node_name: string,
		current_operation_container: SopOperationContainer
	) {
		const node_data: NodeJsonExporterData = data[node_name];
		const inputs_data = node_data['inputs'];
		if (!inputs_data) {
			return;
		}
		for (let input_data of inputs_data) {
			if (CoreType.isString(input_data)) {
				const input_node_data = data[input_data];
				if (input_node_data) {
					if (
						OptimizedNodesJsonImporter.is_node_optimized(input_node_data) &&
						!this._optimized_root_node_names.has(input_data) // ensure it is not a root
					) {
						// ensure we do not create multiple operation containers from the same node
						let operation_container = this._operation_containers_by_name.get(input_data);
						if (!operation_container) {
							// if the input is an optimized node, we create an operation and go recursive
							operation_container = this._create_operation_container(
								scene_importer,
								node,
								input_node_data,
								input_data
							) as SopOperationContainer;
							if (operation_container) {
								this._add_optimized_node_inputs(
									scene_importer,
									node,
									data,
									input_data,
									operation_container
								);
							}
						}
						current_operation_container.add_input(operation_container);
					} else {
						// if the input is NOT an optimized node, we set the input to the node
						const input_node = node.parent?.node(input_data);
						if (input_node) {
							this._node_inputs.push(input_node);
							const node_input_index = this._node_inputs.length - 1;
							// node.setInput(node_input_index, input_node as BaseSopNodeType);
							node.add_input_config(current_operation_container, {
								operation_input_index: current_operation_container.current_input_index(),
								node_input_index: node_input_index,
							});
							current_operation_container.increment_input_index();
						}
					}
				}
			}
		}

		// once the inputs have been set, we can initialize the inputs_clone_state
		if (node_data.cloned_state_overriden == true) {
			current_operation_container.override_input_clone_state(node_data.cloned_state_overriden);
		}
	}

	static child_names_by_optimized_state(data: PolyDictionary<NodeJsonExporterData>) {
		const node_names = Object.keys(data);
		const optimized_names: string[] = [];
		const non_optimized_names: string[] = [];
		for (let node_name of node_names) {
			const node_data = data[node_name];
			const optimized_state = Poly.instance().playerMode() && this.is_node_optimized(node_data);
			if (optimized_state) {
				optimized_names.push(node_name);
			} else {
				non_optimized_names.push(node_name);
			}
		}
		return {optimized_names, non_optimized_names};
	}

	// private _optimized_names_for_root(
	// 	data: PolyDictionary<NodeJsonExporterData>,
	// 	current_node_name: string,
	// 	current_node_data: NodeJsonExporterData,
	// 	input_names: string[] = []
	// ) {
	// 	input_names.push(current_node_name);
	// 	const inputs = current_node_data['inputs'];
	// 	if (inputs) {
	// 		for (let input_data of inputs) {
	// 			if (CoreType.isString(input_data)) {
	// 				const input_node_name = input_data;
	// 				// if (input_node_name != current_node_name) {
	// 				const input_node_data = data[input_node_name];

	// 				if (input_node_data) {
	// 					if (
	// 						OptimizedNodesJsonImporter.is_node_optimized(input_node_data) &&
	// 						!this._is_optimized_root_node(data, input_node_name, input_node_data)
	// 					) {
	// 						this._optimized_names_for_root(data, input_node_name, input_node_data, input_names);
	// 					}
	// 				}
	// 				// }
	// 			}
	// 		}
	// 	}
	// 	return input_names;
	// }

	// a node will be considered optimized root node if:
	// - it has no output
	// - at least one output is not optimized (as it if it has 2 outputs, and only 1 is optimized, it will not be considered root)
	static is_optimized_root_node_generic(data: RootNodeGenericData): boolean {
		if (data.outputs_count == 0) {
			return true;
		}
		if (data.non_optimized_count > 0) {
			return true;
		}
		return false;
	}
	static is_optimized_root_node(data: PolyDictionary<NodeJsonExporterData>, current_node_name: string) {
		const output_names = this.node_outputs(data, current_node_name);

		let non_optimized_count = 0;
		output_names.forEach((node_name) => {
			const node_data = data[node_name];
			if (!this.is_node_optimized(node_data)) {
				non_optimized_count++;
			}
		});

		return this.is_optimized_root_node_generic({
			outputs_count: output_names.size,
			non_optimized_count: non_optimized_count,
		});
	}
	// same algo as is_optimized_root_node, but for a node
	static is_optimized_root_node_from_node<NC extends NodeContext>(node: TypedNode<NC, any>) {
		if (!node.flags?.optimize?.active) {
			return false;
		}

		const output_nodes = node.io.connections.output_connections().map((c) => c.node_dest);
		let non_optimized_count = 0;
		for (let output_node of output_nodes) {
			if (!output_node.flags?.optimize?.active) {
				non_optimized_count++;
			}
		}
		return this.is_optimized_root_node_generic({
			outputs_count: output_nodes.length,
			non_optimized_count: non_optimized_count,
		});
	}

	static node_outputs(
		data: PolyDictionary<NodeJsonExporterData>,
		current_node_name: string
		// current_node_data: NodeJsonExporterData
	) {
		const node_names = Object.keys(data);
		const output_node_names: Set<string> = new Set();
		for (let node_name of node_names) {
			if (node_name != current_node_name) {
				const node_data = data[node_name];
				const inputs = node_data['inputs'];
				if (inputs) {
					for (let input_data of inputs) {
						if (CoreType.isString(input_data)) {
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

	private _create_operation_container(
		scene_importer: SceneJsonImporter,
		node: OperationsComposerSopNode,
		node_data: NodeJsonExporterData,
		node_name: string
	) {
		const non_spare_params_data = ParamJsonImporter.non_spare_params_data_value(node_data['params']);
		const operation_type = OptimizedNodesJsonImporter.operation_type(node_data);
		const operation_container = this._node.create_operation_container(
			operation_type,
			node_name,
			non_spare_params_data
		) as SopOperationContainer;
		if (operation_container) {
			// ensure we do not create another operation container from the same node
			this._operation_containers_by_name.set(node_name, operation_container);

			// store for path_param resolve when all nodes are created
			if (operation_container.path_param_resolve_required()) {
				node.add_operation_container_with_path_param_resolve_required(operation_container);
				scene_importer.add_operations_composer_node_with_path_param_resolve_required(node);
			}
		}

		return operation_container;
	}

	static operation_type(node_data: NodeJsonExporterData) {
		if (OptimizedNodesJsonImporter.is_node_bypassed(node_data)) {
			return 'null';
		}
		return node_data['type'];
	}

	static is_node_optimized(node_data: NodeJsonExporterData) {
		const node_flags = node_data['flags'];
		if (node_flags && node_flags['optimize']) {
			return true;
		}
		return false;
	}
	static is_node_bypassed(node_data: NodeJsonExporterData) {
		const node_flags = node_data['flags'];
		if (node_flags && node_flags['bypass']) {
			return true;
		}
		return false;
	}
}
