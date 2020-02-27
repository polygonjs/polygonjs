import {TypedNode} from '../_Base';

// import {LineType} from './code/utils/CodeBuilder';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';

import {AssemblerControllerNode} from './code/Controller';

import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamType} from '../../poly/ParamType';
import {ParamValue} from '../../params/types/ParamValue';

import {NodeEvent} from '../../poly/NodeEvent';
import {BaseNamedConnectionPointType, TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ParamTypeToConnectionPointTypeMap} from '../utils/connections/ConnectionPointType';
import {ParamValueToDefaultConverter} from '../utils/params/ParamValueToDefaultConverter';
// import {ShaderName} from '../utils/shaders/ShaderName';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';

export class TypedGlNode<K extends NodeParamsConfig> extends TypedNode<'GL', BaseGlNodeType, K> {
	static node_context(): NodeContext {
		return NodeContext.GL;
	}
	protected _param_configs_controller: ParamConfigsController | undefined;
	protected _assembler: BaseGlShaderAssembler | undefined;
	private _set_mat_to_recompile_bound = this._set_mat_to_recompile.bind(this);

	initialize_base_node() {
		this.io.inputs.set_depends_on_inputs(false);
		this.io.connections.init_inputs();
		this.ui_data.set_layout_horizontal();
		this.io.outputs.set_named_output_connection_points([]);
		this.add_post_dirty_hook('_set_mat_to_recompile', this._set_mat_to_recompile_bound);

		this.params.set_post_create_params_hook(this.create_inputs_from_params.bind(this));
	}
	private _set_mat_to_recompile() {
		this.material_node?.assembler_controller.set_compilation_required_and_dirty(this);
	}
	get material_node(): AssemblerControllerNode | undefined {
		if (this.parent) {
			if (this.parent.type == this.type) {
				return (this.parent as BaseGlNodeType)?.material_node;
			} else {
				return this.parent as AssemblerControllerNode;
			}
		}
	}

	//
	//
	// VARIABLES
	//
	//
	gl_var_name(name: string) {
		return `v_POLY_${this.name}_${name}`;
	}

	variable_for_input(name: string): string {
		const input_index = this.io.inputs.get_input_index(name);
		const connection = this.io.connections.input_connection(input_index);
		if (connection) {
			const input_node = (<unknown>connection.node_src) as BaseGlNodeType;
			const output_name = input_node.io.outputs.named_output_connection_points[connection.output_index].name;
			return input_node.gl_var_name(output_name);
		} else {
			return ThreeToGl.any(this.params.get(name)?.value);
		}
	}

	//
	//
	// ADDED LINES
	//
	//
	set_lines(shaders_collection_controller: ShadersCollectionController) {}

	reset_code() {
		this._param_configs_controller?.reset();
		// this.reset_lines();
	}

	//
	//
	// PARAMS
	//
	//

	protected _allow_inputs_created_from_params: boolean = true;
	create_inputs_from_params() {
		if (!this._allow_inputs_created_from_params) {
			return;
		}
		const connections: BaseNamedConnectionPointType[] = [];
		const inputless_params_names = this.inputless_params_names();
		this.params.names.forEach((param_name) => {
			let add_input = true;
			if (inputless_params_names.length > 0 && inputless_params_names.includes(param_name)) {
				add_input = false;
			}
			if (add_input) {
				const param = this.params.get(param_name);
				if (param && !param.parent_param) {
					const connection_type = ParamTypeToConnectionPointTypeMap[param.type];
					if (connection_type) {
						const connection = new TypedNamedConnectionPoint(param.name, connection_type);
						connections.push(connection);
					}
				}
			}
		});
		this.io.inputs.set_named_input_connection_points(connections);
	}
	inputless_params_names(): string[] {
		return [];
	}
	protected create_spare_parameters() {
		const values_by_param_name: Map<string, ParamValue> = new Map();
		const current_param_names: string[] = this.params.spare_names;
		let has_deleted_a_param = false;
		let has_created_a_param = false;
		current_param_names.forEach((param_name) => {
			const param = this.params.get(param_name);
			if (param) {
				values_by_param_name.set(param_name, param.value);
				this.params.delete_param(param_name);
				has_deleted_a_param = true;
			}
		});

		// TODO: typescript: fix this confusion between named_inputs and NamedConnection
		this.io.inputs.named_input_connection_points.forEach((connection_point) => {
			const param_name = connection_point.name;

			const last_param_value = values_by_param_name.get(param_name);
			if (last_param_value != null) {
				const param_type: ParamType = connection_point.param_type;
				let init_value = ParamValueToDefaultConverter.from_value(param_type, last_param_value);
				if (init_value == null) {
					const default_value_from_name = this.gl_input_default_value(param_name);
					if (default_value_from_name != null) {
						init_value = default_value_from_name;
					}
				}
				// if (default_value == null) {
				// 	default_value = gl_connection.default_value();
				// }
				if (init_value == null && connection_point.init_value) {
					init_value = connection_point.init_value;
				}

				this.add_param(param_type, param_name, init_value, {
					spare: true,
					cook: true,
				});
				has_created_a_param = true;
			}
		});

		if (has_created_a_param || has_deleted_a_param) {
			if (!this.scene.loading_controller.is_loading) {
				this.emit(NodeEvent.PARAMS_UPDATED);
			}
		}
	}
	//
	//
	// PARAM CONFIGS
	//
	//
	public set_param_configs() {}
	param_configs() {
		return this._param_configs_controller?.list;
	}
	// private reset_param_configs() {
	// 	this._param_configs = [];
	// }
	// add_param_config<T extends ParamType>(
	// 	type: T,
	// 	name: string,
	// 	default_value: ParamInitValuesTypeMap[T],
	// 	uniform_name: string
	// ) {
	// 	const param_config = new ParamConfig(type, name, default_value, uniform_name);
	// 	this._param_configs.push(param_config);
	// }
	// param_configs() {
	// 	return this._param_configs;
	// }
	//
	//
	// INPUT
	//
	//
	protected gl_input_default_value(name: string): ParamInitValueSerialized {
		return null;
	}

	//
	//
	// MISC
	//
	//

	// used when a node changes its signature, adn the output nodes need to adapt their own signatures
	protected make_output_nodes_dirty() {
		this.io.connections
			.output_connections()
			.map((c) => c.node_dest)
			.forEach((o) => {
				o.set_dirty(this);
			});
	}

	//
	//
	// NEEDED?
	//
	//
	// set_assembler(assembler: BaseGlShaderAssembler) {
	// 	this._assembler = assembler;
	// }
	// get assembler(): BaseGlShaderAssembler | undefined {
	// 	return this._assembler;
	// }

	// shader_configs() {
	// 	return this.assembler?.shader_configs || [];
	// }
	// shader_config(name: string) {
	// 	return this.assembler?.shader_config(name);
	// }
	// shader_names() {
	// 	return this.assembler?.shader_names || [];
	// }
}

export type BaseGlNodeType = TypedGlNode<NodeParamsConfig>;
export class BaseGlNodeClass extends TypedGlNode<NodeParamsConfig> {}
