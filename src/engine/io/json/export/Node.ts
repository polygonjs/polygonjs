import {PersistedConfigWithShaders} from './../../../nodes/utils/BasePersistedConfig';
import {Number2, PolyDictionary} from '../../../../types/GlobalTypes';
import {BaseNodeType, TypedNode} from '../../../nodes/_Base';
import {NodeContext} from '../../../poly/NodeContext';
import type {JsonExportDispatcher} from './Dispatcher';
import {ParamJsonExporterData} from '../../../nodes/utils/io/IOController';
import {ParamType} from '../../../poly/ParamType';
import {BaseConnectionPointData} from '../../../nodes/utils/io/connections/_Base';
import {sanitizeExportedString} from './sanitize';
import {isString} from '../../../../core/Type';
import {VelocityColliderFunctionBody} from '../../../nodes/js/code/assemblers/_Base';

// revert to using index instead of name
// for gl nodes such as the if node, whose input names
// changes depending on the input
interface NamedInputData {
	index?: number;
	inputName?: string;
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

	flags?: FlagsData;
	cloned_state_overriden?: boolean;
	persisted_config?: PersistedConfigWithShaders;
	polyNode?: {
		locked: boolean;
	};
}

export interface NodeJsonExporterUIData {
	pos?: Number2;
	comment?: string;
	selection?: string[];
	nodes?: PolyDictionary<NodeJsonExporterUIData>;
}
export type NodeJSONShadersData = PolyDictionary<PolyDictionary<string>>;
export type NodeJSONFunctionBodiesData = PolyDictionary<string | PolyDictionary<string>>;

type BaseNodeTypeWithIO = TypedNode<NodeContext, any>;

export interface JSONExporterDataRequestOption {
	showPolyNodesData?: boolean;
	withPersistedConfig?: boolean;
}

export class NodeJsonExporter<T extends BaseNodeTypeWithIO> {
	private _data: NodeJsonExporterData | undefined; // = {} as NodeJsonExporterData;
	constructor(protected _node: T, protected dispatcher: JsonExportDispatcher) {}

	async data(options: JSONExporterDataRequestOption): Promise<NodeJsonExporterData> {
		if (!this._isRoot()) {
			this._node.scene().nodesController.registerNodeContextSignature(this._node);
		}
		this._data = {
			type: this._node.type(),
		} as NodeJsonExporterData;

		if (this._node.polyNodeController) {
			this._data['polyNode'] = {
				locked: this._node.polyNodeController.locked(),
			};
		}

		// const required_imports = this._node.required_imports()
		// if(required_imports){
		// 	this._data['required_imports'] = required_imports
		// }

		const nodes_data = await this.nodes_data(options);
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
		if (!this._isRoot()) {
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

		// inputs clone
		if (this._node.io.inputs.overrideClonedStateAllowed()) {
			const overriden = this._node.io.inputs.clonedStateOverriden();
			if (overriden) {
				this._data['cloned_state_overriden'] = overriden;
			}
		}

		// persisted config
		const withPersistedConfig = options.withPersistedConfig == null ? true : options.withPersistedConfig;
		if (withPersistedConfig == true) {
			const persisted_config = this._node.persisted_config;
			if (persisted_config) {
				const persisted_config_data = options.showPolyNodesData
					? await persisted_config.toData()
					: await persisted_config.toDataWithoutShaders();
				if (persisted_config_data) {
					this._data.persisted_config = persisted_config_data;
				}
			}
		}

		// custom
		this.add_custom();

		return this._data;
	}

	uiData(options: JSONExporterDataRequestOption): NodeJsonExporterUIData {
		const data: NodeJsonExporterUIData = this.ui_data_without_children();
		const children = this._node.children();
		if (children.length > 0) {
			const nodesData: PolyDictionary<NodeJsonExporterUIData> = {};
			for (let child of children) {
				const node_exporter = this.dispatcher.dispatchNode(child); //.visit(JsonExporterVisitor); //.json_exporter()
				nodesData[child.name()] = node_exporter.uiData(options);
			}
			data['nodes'] = nodesData;
		}

		return data;
	}
	protected ui_data_without_children(): NodeJsonExporterUIData {
		const data: NodeJsonExporterUIData = {} as NodeJsonExporterUIData;
		if (!this._isRoot()) {
			const ui_data = this._node.uiData;
			data['pos'] = ui_data.position().toArray() as Number2;
			const comment = ui_data.comment();
			if (comment) {
				data['comment'] = sanitizeExportedString(comment);
			}

			// selection
			if (this._node.childrenAllowed()) {
				const selection = this._node.childrenController?.selection;
				if (selection && this._node.children().length > 0) {
					// only save the nodes that are still present, in case the selection just got deleted
					const selected_children: BaseNodeTypeWithIO[] = [];
					const selected_ids: PolyDictionary<boolean> = {};
					const selectedNodes: BaseNodeType[] = [];
					selection.nodes(selectedNodes);
					for (const selected_node of selectedNodes) {
						selected_ids[selected_node.graphNodeId()] = true;
					}
					for (const child of this._node.children()) {
						if (child.graphNodeId() in selected_ids) {
							selected_children.push(child);
						}
					}
					const selection_data = selected_children.map((n) => n.name());
					if (selection_data.length > 0) {
						data['selection'] = selection_data;
					}
				}
			}
		}
		return data;
	}
	async persistedConfigData(
		shadersData: NodeJSONShadersData,
		jsFunctionBodiesData: NodeJSONFunctionBodiesData,
		options: JSONExporterDataRequestOption
	): Promise<void> {
		const children = this._node.children();
		if (children.length > 0) {
			for (let child of children) {
				const node_exporter = this.dispatcher.dispatchNode(child);
				await node_exporter.persistedConfigData(shadersData, jsFunctionBodiesData, options);
			}
		}

		if (this._node.persisted_config) {
			const persisted_config_data = await this._node.persisted_config.toData();
			if (persisted_config_data) {
				if (persisted_config_data.shaders) {
					shadersData[this._node.path()] = persisted_config_data.shaders;
					return;
				}
				if (persisted_config_data.functionBody != null) {
					if (isString(persisted_config_data.functionBody)) {
						jsFunctionBodiesData[this._node.path()] = persisted_config_data.functionBody;
						return;
					} else {
						const dict: Record<string, string> = {};
						const keys = Object.keys(persisted_config_data.functionBody) as Array<
							keyof VelocityColliderFunctionBody
						>;
						for (let key of keys) {
							dict[key] = persisted_config_data.functionBody[key];
						}
						jsFunctionBodiesData[this._node.path()] = dict;
						return;
					}
				}
				console.warn(`persisted config data not handled`, persisted_config_data);
			}
		}
	}
	// async jsFunctionBodies(data: NodeJSONFunctionBodiesData, options: JSONExporterDataRequestOption = {}): Promise<void> {
	// 	const children = this._node.children();
	// 	if (children.length > 0) {
	// 		for (let child of children) {
	// 			const node_exporter = this.dispatcher.dispatchNode(child);
	// 			await node_exporter.jsFunctionBodies(data);
	// 		}
	// 	}

	// 	if (this._node.persisted_config) {
	// 		const persisted_config_data = await this._node.persisted_config.toData();
	// 		if (persisted_config_data && persisted_config_data.functionBody) {
	// 			data[this._node.path()] = persisted_config_data.functionBody
	// 		}
	// 	}
	// }

	private _isRoot() {
		return this._node.parent() === null && this._node.graphNodeId() == this._node.root().graphNodeId();
	}

	protected inputs_data() {
		const data: InputData[] = [];
		this._node.io.inputs.inputs().forEach((input, input_index) => {
			if (input) {
				const connection = this._node.io.connections.inputConnection(input_index)!;
				if (this._node.io.inputs.hasNamedInputs()) {
					const inputConnectionPoints = this._node.io.inputs.namedInputConnectionPoints();
					const outputConnectionPoints = input.io.outputs.namedOutputConnectionPoints();
					if (inputConnectionPoints && outputConnectionPoints) {
						const inputName = inputConnectionPoints[input_index]?.name();
						const output_index = connection.outputIndex();
						const output_name = outputConnectionPoints[output_index]?.name();
						if (output_name) {
							data[input_index] = {
								index: input_index,
								inputName: inputName,
								node: input.name(),
								output: output_name,
							};
						}
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
				const connectionPoints = this._node.io.inputs.namedInputConnectionPoints();
				if (connectionPoints) {
					for (let cp of connectionPoints) {
						if (cp) {
							data['in'].push(cp.toJSON());
						}
					}
				}
			}
			if (this._node.io.outputs.hasNamedOutputs()) {
				data['out'] = [];
				const connectionPoints = this._node.io.outputs.namedOutputConnectionPoints();
				if (connectionPoints) {
					for (let cp of connectionPoints) {
						if (cp) {
							data['out'].push(cp.toJSON());
						}
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
				const param_exporter = this.dispatcher.dispatchParam(param);
				if (param_exporter.required()) {
					const params_data = param_exporter.data();
					data[param.name()] = params_data;
				}
			}
		}

		return data;
	}

	protected async nodes_data(options: JSONExporterDataRequestOption) {
		const data: PolyDictionary<NodeJsonExporterData> = {};
		for (let child of this._node.children()) {
			const node_exporter = this.dispatcher.dispatchNode(child); //.json_exporter()
			data[child.name()] = await node_exporter.data(options);
		}
		return data;
	}

	protected add_custom() {}
}
