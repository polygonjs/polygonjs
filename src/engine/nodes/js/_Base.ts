import lodash_includes from 'lodash/includes';
import {TypedNode} from '../_Base';
import {LineType} from './code/utils/CodeBuilder';
import {ParamConfig} from '../utils/code/configs/ParamConfig';
import {ThreeToGl} from 'src/core/ThreeToGl';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {BaseGLDefinition} from './utils/GLDefinition';
import {AssemblerControllerNode} from './code/Controller';

import {NodeContext} from 'src/engine/poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamType} from 'src/engine/poly/ParamType';
import {ParamInitValuesTypeMap} from 'src/engine/params/types/ParamInitValuesTypeMap';
import {ParamValue} from 'src/engine/params/types/ParamValue';

import {NodeEvent} from 'src/engine/poly/NodeEvent';
import {BaseNamedConnectionPointType, TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ParamTypeToConnectionPointTypeMap} from '../utils/connections/ConnectionPointType';
import {ParamValueToDefaultConverter} from '../utils/params/ParamValueToDefaultConverter';
import {ShaderName} from '../utils/shaders/ShaderName';
import {MapUtils} from 'src/core/MapUtils';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';

export class TypedJsNode<K extends NodeParamsConfig> extends TypedNode<'JS', BaseJsNodeType, K> {
	static node_context(): NodeContext {
		return NodeContext.JS;
	}

	private _definitions: Map<ShaderName, BaseGLDefinition[]> = new Map();
	private _lines: Map<ShaderName, Map<LineType, string[]>> = new Map();
	// private _param_configs: ParamConfig<ParamType>[] = [];
	protected _param_configs_controller: ParamConfigsController | undefined;
	protected _shader_name: ShaderName | undefined;
	protected _assembler: BaseGlShaderAssembler | undefined;
	private _set_builder_to_recompile_bound = this._set_builder_to_recompile.bind(this);

	initialize_base_node() {
		this.io.inputs.set_depends_on_inputs(false);
		this.io.connections.init_inputs();
		this.ui_data.set_layout_horizontal();
		this.io.outputs.set_named_output_connection_points([]);
		this.add_post_dirty_hook('_set_builder_to_recompile', this._set_builder_to_recompile_bound);
	}
	private _set_builder_to_recompile() {
		this.builder_node?.recompile(this);
	}

	get builder_node(): AssemblerControllerNode | undefined {
		if (this.parent) {
			if (this.parent.type == this.type) {
				return (this.parent as BaseJsNodeType)?.builder_node;
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
		return `v_POLYGON_${this.name}_${name}`;
	}

	variable_for_input(name: string): string {
		const input_index = this.io.inputs.get_input_index(name);
		const connection = this.io.connections.input_connection(input_index);
		if (connection) {
			const input_node = (<unknown>connection.node_src) as BaseJsNodeType;
			const output_name = input_node.io.outputs.named_output_connection_points[connection.output_index].name;
			return input_node.gl_var_name(output_name);
		} else {
			return ThreeToGl.any(this.params.get(name)?.value_serialized);
		}
	}

	//
	//
	// ADDED LINES
	//
	//
	reset_code() {
		this._param_configs_controller?.reset();
		this.reset_lines();
	}
	set_lines() {}
	private reset_lines() {
		this._definitions = new Map();
		this._lines = new Map();
	}
	set_definitions(definitions: BaseGLDefinition[], shader_name?: ShaderName) {
		shader_name = shader_name || this._shader_name;
		if (shader_name) {
			this._definitions.set(shader_name, definitions);
		}
		// if(this._shader_name == ShaderName.VERTEX){
		// 	this._vertex_definitions = definitions
		// } else {
		// 	this._fragment_definitions = definitions
		// }
	}
	add_definitions(definitions: BaseGLDefinition[], shader_name?: ShaderName) {
		shader_name = shader_name || this._shader_name;
		if (shader_name) {
			MapUtils.concat_on_array_at_entry(this._definitions, shader_name, definitions);
		}
		// if(this._shader_name == ShaderName.VERTEX){
		// 	this._vertex_definitions = this._vertex_definitions.concat(definitions)
		// } else {
		// 	this._fragment_definitions = this._fragment_definitions.concat(definitions)
		// }
	}
	set_body_lines(lines: string[], shader_name?: ShaderName) {
		shader_name = shader_name || this._shader_name;
		if (shader_name) {
			let lines_by_line_type: Map<LineType, string[]> | undefined = this._lines.get(shader_name);
			const has_entry = lines_by_line_type != null;
			lines_by_line_type = lines_by_line_type || new Map();
			lines_by_line_type.set(LineType.BODY, lines);
			if (!has_entry) {
				this._lines.set(shader_name, lines_by_line_type);
			}
		}
	}
	add_body_lines(lines: string[], shader_name?: ShaderName) {
		shader_name = shader_name || this._shader_name;
		if (shader_name) {
			let lines_by_line_type: Map<LineType, string[]> | undefined = this._lines.get(shader_name);
			const has_entry = lines_by_line_type != null;
			lines_by_line_type = lines_by_line_type || new Map();
			lines_by_line_type.set(LineType.BODY, lines);
			MapUtils.concat_on_array_at_entry(lines_by_line_type, LineType.BODY, lines);

			if (!has_entry) {
				this._lines.set(shader_name, lines_by_line_type);
			}
		}
	}

	lines(shader_name: ShaderName, line_type: LineType) {
		const lines_for_shader_name = this._lines.get(shader_name);
		if (lines_for_shader_name) {
			return lines_for_shader_name.get(line_type);
		}
	}
	all_lines() {
		return this._lines;
	}
	definitions(shader_name: ShaderName) {
		return this._definitions.get(shader_name);
	}

	//
	//
	// PARAMS
	//
	//
	protected create_spare_parameters() {
		const values_by_param_name: Map<string, ParamValue> = new Map();
		const current_param_names: string[] = this.params.spare_names;
		current_param_names.forEach((param_name) => {
			const param = this.params.get(param_name);
			if (param) {
				values_by_param_name.set(param_name, param.value);
				this.params.delete_param(param_name);
			}
		});

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
			}
		});

		if (!this.scene.loading_controller.is_loading) {
			this.emit(NodeEvent.PARAMS_UPDATED);
		}
	}
	post_create_params() {
		this.create_inputs_from_params();
	}
	create_inputs_from_params() {
		const connections: BaseNamedConnectionPointType[] = [];
		const inputless_params_names = this.inputless_params_names();
		this.params.names.forEach((param_name) => {
			let add_input = true;
			if (inputless_params_names.length > 0 && lodash_includes(inputless_params_names, param_name)) {
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
	//
	//
	// PARAM CONFIGS
	//
	//
	public set_param_configs() {}
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
	protected gl_input_default_value(name: string) {
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
	// shader_configs() {
	// 	return this.assembler?.shader_configs || [];
	// }
	// shader_config(name: string) {
	// 	return this.assembler?.shader_config(name);
	// }
	// shader_names() {
	// 	return this.assembler?.shader_names || [];
	// }
	// set_shader_name(shader_name: ShaderName) {
	// 	this._shader_name = shader_name;
	// }
	// get shader_name() {
	// 	return this._shader_name;
	// }
	// set_assembler(assembler: BaseGlShaderAssembler) {
	// 	this._assembler = assembler;
	// }
	// get assembler(): BaseGlShaderAssembler | undefined {
	// 	return this._assembler;
	// }
}

export type BaseJsNodeType = TypedJsNode<NodeParamsConfig>;
export class BaseJsNodeClass extends TypedJsNode<NodeParamsConfig> {}
