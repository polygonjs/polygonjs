import {TypedNode} from '../../../nodes/_Base';
import {Vector2} from 'three';
import type {JsonImportDispatcher} from './Dispatcher';
import {ParamType} from '../../../poly/ParamType';
import {ParamsUpdateOptions} from '../../../nodes/utils/params/ParamsController';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeContext} from '../../../poly/NodeContext';
import {NodeJsonExporterData, NodeJsonExporterUIData, InputData, IoConnectionPointsData} from '../export/Node';
import {
	ParamJsonExporterData,
	SimpleParamJsonExporterData,
	ComplexParamJsonExporterData,
} from '../../../nodes/utils/io/IOController';
import type {NodesJsonImporter} from './Nodes';
import {Poly} from '../../../Poly';
import {CoreType} from '../../../../core/Type';
// import {CoreString} from '../../../../core/String';
import {PolyDictionary} from '../../../../types/GlobalTypes';

const COMPLEX_PARAM_DATA_KEYS: Readonly<string[]> = ['overriden_options', 'type'];

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;
export class NodeJsonImporter<T extends BaseNodeTypeWithIO> {
	constructor(
		protected _node: T,
		private dispatcher: JsonImportDispatcher,
		protected nodesImporter: NodesJsonImporter<any>
	) {}

	process_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterData) {
		this.set_connection_points(data['connection_points']);

		// rather than having the children creation dependent on the persisted config and player mode, use the childrenAllowed() method
		// const skip_create_children = Poly.playerMode() && data.persisted_config;
		if (this._node.childrenAllowed()) {
			this.create_nodes(scene_importer, data['nodes'], data);
		}

		// inputs clone
		if (this._node.io.inputs.overrideClonedStateAllowed()) {
			const override = data['cloned_state_overriden'];
			if (override) {
				this._node.io.inputs.overrideClonedState(override);
			}
		}

		this.set_flags(data);

		// params
		// const spare_params_data = ParamJsonImporter.spare_params_data(data['params']);
		// this.set_params(spare_params_data);
		this.set_params(data);

		if (data.persisted_config) {
			const shadersData = scene_importer.shadersData();
			if (shadersData) {
				let shaders = shadersData[this._node.path()];
				// make sure this is never undefined
				if (!shaders) {
					shaders = {};
				}
				data.persisted_config.shaders = shaders;
			}
			this.set_persisted_config(data.persisted_config);
		}

		this.setCustomData(data);

		// already called in create_node()
		// this._node.lifecycle.set_creation_completed();
	}
	process_inputs_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterData) {
		const maxInputsCount = data.maxInputsCount;
		if (maxInputsCount != null) {
			const minCount = this._node.io.inputs.minCount();
			this._node.io.inputs.setCount(minCount, maxInputsCount);
		}

		try {
			this.setInputs(data['inputs']);
		} catch (err) {
			const message = (err as ErrorEvent).message || `failed connecting inputs of node ${data['type']}`;
			scene_importer.report.addWarning(message);
			console.warn(data['inputs']);
		}
	}

	process_ui_data(scene_importer: SceneJsonImporter, data: NodeJsonExporterUIData) {
		if (!data) {
			return;
		}
		if (Poly.playerMode()) {
			return;
		}
		const ui_data = this._node.uiData;
		const pos = data['pos'];
		if (pos) {
			const vector = new Vector2().fromArray(pos);
			ui_data.setPosition(vector);
		}
		const comment = data['comment'];
		if (comment) {
			ui_data.setComment(comment);
		}
		const selection = data['selection'];
		if (selection) {
			this.set_selection(selection);
		}
		if (this._node.childrenAllowed()) {
			const nodesData = data['nodes'];
			if (nodesData) {
				this.processNodesUiData(scene_importer, nodesData);
			}
		}
	}

	create_nodes(
		scene_importer: SceneJsonImporter,
		data: PolyDictionary<NodeJsonExporterData> | undefined,
		nodeData: NodeJsonExporterData
	) {
		if (!data) {
			return;
		}
		// const nodes_importer = new NodesJsonImporter(this._node);
		this.nodesImporter.process_data(scene_importer, data);
	}
	set_selection(data?: string[]) {
		if (this._node.childrenAllowed() && this._node.childrenController) {
			if (data && data.length > 0) {
				const selected_nodes: BaseNodeTypeWithIO[] = [];
				data.forEach((node_name) => {
					const node = this._node.node(node_name);
					if (node) {
						selected_nodes.push(node);
					}
				});
				this._node.childrenController.selection.set(selected_nodes);
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
			const optimize = flags['optimize'];
			if (optimize != null) {
				this._node.flags?.optimize?.set(optimize);
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

	private setInputs(inputs_data?: InputData[]) {
		if (!inputs_data) {
			return;
		}

		let input_data: InputData;
		for (let i = 0; i < inputs_data.length; i++) {
			input_data = inputs_data[i];
			if (input_data && this._node.parent()) {
				if (CoreType.isString(input_data)) {
					const input_node_name = input_data;
					const input_node = this._node.nodeSibling(input_node_name);
					this._node.setInput(i, input_node);
				} else {
					const input_node = this._node.nodeSibling(input_data['node']);
					const input_index = input_data['index'];
					this._node.setInput(input_index, input_node, input_data['output']);
				}
			}
		}
	}

	processNodesUiData(scene_importer: SceneJsonImporter, data: PolyDictionary<NodeJsonExporterUIData>) {
		if (!data) {
			return;
		}
		if (Poly.playerMode()) {
			return;
		}

		const node_names = Object.keys(data);
		for (let node_name of node_names) {
			const node = this._node.node(node_name);
			if (node) {
				const node_data = data[node_name];
				this.dispatcher.dispatchNode(node).process_ui_data(scene_importer, node_data);
				// node.visit(JsonImporterVisitor).process_ui_data(node_data);
			}
		}
	}

	//
	//
	// PARAMS
	//
	//
	set_params(nodeData: NodeJsonExporterData) {
		const data = nodeData['params'];
		if (!data) {
			return;
		}
		const param_names = Object.keys(data);

		const params_update_options: ParamsUpdateOptions = {};
		for (let param_name of param_names) {
			const param_data = data[param_name] as ComplexParamJsonExporterData<ParamType>;
			if (param_data != null) {
				const options = param_data['options'];
				// const is_spare = options && options['spare'] === true;

				// make camelCase if required
				// if (false && param_name.includes('_')) {
				// 	param_name = CoreString.camelCase(param_name);
				// }

				let param_type = param_data['type']!;
				// backward compatibiity: ensure that old param of type 'operator_path'
				// are converted to a NodePath param
				if ((param_type as string) == 'operator_path') {
					param_type = ParamType.NODE_PATH;
				}

				const has_param = this._node.params.has_param(param_name);
				let has_param_and_same_type = false;
				let param;
				if (has_param) {
					param = this._node.params.get(param_name);
					// we can safely consider same type if param_type is not mentioned
					if ((param && param.type() == param_type) || param_type == null) {
						has_param_and_same_type = true;
					}
				}

				if (has_param_and_same_type) {
					if (this._is_param_data_complex(param_data)) {
						this._process_param_data_complex(param_name, param_data);
					} else {
						this._process_param_data_simple(
							param_name,
							param_data as SimpleParamJsonExporterData<ParamType>
						);
					}
				} else {
					// it the param is a spare one,
					// we check if it is currently exists with same type first.
					// - if it is, we only update the value
					// - if it's not, we delete it and add it again
					params_update_options.namesToDelete = params_update_options.namesToDelete || [];
					params_update_options.namesToDelete.push(param_name);
					params_update_options.toAdd = params_update_options.toAdd || [];
					params_update_options.toAdd.push({
						name: param_name,
						type: param_type,
						initValue: param_data['default_value'] as any,
						rawInput: param_data['raw_input'] as any,
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
		}

		// delete and create the spare params we need to
		const params_delete_required =
			params_update_options.namesToDelete && params_update_options.namesToDelete.length > 0;
		const params_add_required = params_update_options.toAdd && params_update_options.toAdd.length > 0;

		if (params_delete_required || params_add_required) {
			this._node.params.updateParams(params_update_options);
			// update them based on the imported data
			for (let spare_param of this._node.params.spare) {
				const param_data = data[spare_param.name()] as ComplexParamJsonExporterData<ParamType>;
				// JsonImportDispatcher.dispatch_param(spare_param).process_data(param_data);
				if (!spare_param.parentParam() && param_data) {
					if (this._is_param_data_complex(param_data)) {
						this._process_param_data_complex(spare_param.name(), param_data);
					} else {
						this._process_param_data_simple(
							spare_param.name(),
							param_data as SimpleParamJsonExporterData<ParamType>
						);
					}
				}
			}
		}
		// those hooks are useful for some gl nodes,
		// such as the constant, which needs to update its connections
		// based on another parameter, which will be set just before
		this._node.params.runOnSceneLoadHooks();
	}

	private _process_param_data_simple(param_name: string, param_data: SimpleParamJsonExporterData<ParamType>) {
		this._node.params.get(param_name)?.set(param_data);
	}

	private _process_param_data_complex(param_name: string, param_data: ComplexParamJsonExporterData<ParamType>) {
		const param = this._node.params.get(param_name);
		if (param) {
			this.dispatcher.dispatchParam(param).process_data(param_data);
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
			CoreType.isString(param_data) ||
			CoreType.isNumber(param_data) ||
			CoreType.isArray(param_data) ||
			CoreType.isBoolean(param_data)
		) {
			return false;
		}

		if (CoreType.isObject(param_data)) {
			const keys = Object.keys(param_data);
			for (let complex_key of COMPLEX_PARAM_DATA_KEYS) {
				if (keys.includes(complex_key)) {
					return true;
				}
			}
		}

		return false;
	}

	set_persisted_config(persisted_config_data: object) {
		if (this._node.persisted_config) {
			this._node.persisted_config.load(persisted_config_data);
		}
	}

	setCustomData(data: NodeJsonExporterData) {}
}
