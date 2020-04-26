import {JsVariableConfig} from '../configs/VariableConfig';
import {JsCodeBuilder} from '../utils/CodeBuilder';
import {BaseJsNodeType} from '../../_Base';
import {TypedAssembler} from '../../../utils/shaders/BaseAssembler';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../Output';
import {ParamType} from '../../../../poly/ParamType';
import {GlobalsJsNode} from '../../Globals';
import {AttributeJsNode} from '../../Attribute';
import {AssemblerControllerNode} from '../Controller';
import {LinesController} from '../utils/LinesController';
import {ParamJsNode} from '../../Param';
import {NodeContext} from '../../../../poly/NodeContext';
import {JsLineType} from '../utils/LineType';
import {JsConnectionPoint, JsConnectionPointType} from '../../../utils/io/connections/Js';
import {NodeTypeMap} from '../../../../containers/utils/ContainerMap';

type StringArrayByShaderName = Map<ShaderName, string[]>;

export class BaseJsFunctionAssembler extends TypedAssembler<NodeContext.JS> {
	protected _shaders_by_name: Map<ShaderName, string> = new Map();
	protected _lines: StringArrayByShaderName = new Map();
	protected _code_builder: JsCodeBuilder | undefined;
	private _param_config_owner: JsCodeBuilder | undefined;
	protected _root_nodes: BaseJsNodeType[] = [];
	protected _leaf_nodes: BaseJsNodeType[] = [];
	private _uniforms_time_dependent = false;
	private _variable_configs: JsVariableConfig[] | undefined;

	constructor(protected _js_parent_node: AssemblerControllerNode) {
		super();
	}

	get shader_names() {
		return [];
	}
	input_names_for_shader_name(node: NodeTypeMap[NodeContext.JS], shader_name: ShaderName): string[] {
		return [];
	}

	async compile() {}

	compile_allowed(): boolean {
		return true;
	}

	// protected create_material(): ShaderMaterial | undefined {
	// 	return undefined;
	// }
	protected _build_lines() {
		// for (let shader_name of this.shader_names) {
		// 	const template = this._template_shader_for_shader_name(shader_name);
		// 	if (template) {
		// 		this._replace_template(template, shader_name);
		// 	}
		// }
	}

	// protected _build_lines_for_shader_name(shader_name: ShaderName){
	// 	const template = this._template_shader()
	// 	this._replace_template(template[`${shader_name}Shader`], shader_name)
	// }

	set_root_nodes(root_nodes: BaseJsNodeType[]) {
		this._root_nodes = root_nodes;
	}

	//
	//
	// ROOT NODES AND SHADER NAMES
	//
	//
	root_nodes_by_shader_name(shader_name: ShaderName): BaseJsNodeType[] {
		// return this._root_nodes
		const list = [];
		for (let node of this._root_nodes) {
			switch (node.type) {
				case OutputJsNode.type(): {
					list.push(node);
					break;
				}
				case ParamJsNode.type(): {
					list.push(node);
					break;
				}
				case AttributeJsNode.type(): {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler?
					// const attrib_name = (node as AttributeGlNode).attribute_name;
					// const variable = this._texture_allocations_controller.variable(attrib_name);
					// if (variable) {
					// 	const allocation_shader_name = variable.allocation().shader_name();
					// 	if (allocation_shader_name == shader_name) {
					// 		list.push(node);
					// 	}
					// }
					// break;
				}
			}
		}
		return list;
	}
	leaf_nodes(): BaseJsNodeType[] {
		const list = [];
		for (let node of this._leaf_nodes) {
			switch (node.type) {
				case GlobalsJsNode.type(): {
					list.push(node);
					break;
				}
				case AttributeJsNode.type(): {
					// TODO: typescript - gl - why is there a texture allocation controller in the base assembler? AND especially since there is no way to assign it?
					// const attrib_name: string = (node as AttributeGlNode).attribute_name;
					// const variable = this._texture_allocations_controller.variable(attrib_name);
					// if (variable) {
					// 	const allocation_shader_name = variable.allocation().shader_name();
					// 	if (allocation_shader_name == shader_name) {
					// 		list.push(node);
					// 	}
					// }
					// break;
				}
			}
		}
		return list;
	}
	set_node_lines_globals(globals_node: GlobalsJsNode, lines_controller: LinesController) {}
	set_node_lines_output(output_node: OutputJsNode, lines_controller: LinesController) {}
	set_node_lines_attribute(attribute_node: AttributeJsNode, lines_controller: LinesController) {}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	get code_builder() {
		return (this._code_builder = this._code_builder || new JsCodeBuilder(this, this._js_parent_node));
	}
	async build_code_from_nodes(root_nodes: BaseJsNodeType[]) {
		await this.code_builder.build_from_nodes(root_nodes);
	}
	allow_new_param_configs() {
		this.code_builder.allow_new_param_configs();
	}
	disallow_new_param_configs() {
		this.code_builder.disallow_new_param_configs();
	}
	builder_param_configs() {
		return this.code_builder.param_configs();
	}
	builder_lines(line_type: JsLineType) {
		return this.code_builder.lines(line_type);
	}
	all_builder_lines() {
		return this.code_builder.all_lines();
	}
	param_configs() {
		const code_builder = this._param_config_owner || this.code_builder;
		return code_builder.param_configs();
	}
	set_param_configs_owner(param_config_owner: JsCodeBuilder) {
		this._param_config_owner = param_config_owner;
		if (this._param_config_owner) {
			this.code_builder.disallow_new_param_configs();
		} else {
			this.code_builder.allow_new_param_configs();
		}
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	static add_output_params(output_child: OutputJsNode) {
		output_child.params.add_param(ParamType.VECTOR3, 'position', [0, 0, 0], {hidden: true});
		output_child.params.add_param(ParamType.VECTOR3, 'normal', [0, 0, 0], {hidden: true});
		output_child.params.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		output_child.params.add_param(ParamType.VECTOR2, 'uv', [0, 0], {hidden: true});
	}
	add_output_params(output_child: OutputJsNode) {
		BaseJsFunctionAssembler.add_output_params(output_child);
	}
	static create_globals_node_output_connections() {
		return [
			new JsConnectionPoint('position', JsConnectionPointType.VEC3),
			new JsConnectionPoint('normal', JsConnectionPointType.VEC3),
			new JsConnectionPoint('color', JsConnectionPointType.VEC3),
			new JsConnectionPoint('uv', JsConnectionPointType.VEC2),
			new JsConnectionPoint('time', JsConnectionPointType.FLOAT),
		];
	}
	create_globals_node_output_connections() {
		return BaseJsFunctionAssembler.create_globals_node_output_connections();
	}
	add_globals_params(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.set_named_output_connection_points(this.create_globals_node_output_connections());
	}
	allow_attribute_exports() {
		return true;
	}

	//
	//
	// CONFIGS
	//
	//
	reset_configs() {
		this._reset_variable_configs();
		this._reset_uniforms_time_dependency();
	}

	variable_configs() {
		return (this._variable_configs = this._variable_configs || this.create_variable_configs());
	}
	set_variable_configs(variable_configs: JsVariableConfig[]) {
		this._variable_configs = variable_configs;
	}
	variable_config(name: string) {
		return this.variable_configs().filter((vc) => {
			return vc.name() == name;
		})[0];
	}
	static create_variable_configs() {
		return [
			new JsVariableConfig('position'),
			new JsVariableConfig('normal'),
			new JsVariableConfig('color'),
			new JsVariableConfig('uv'),
		];
	}
	create_variable_configs(): JsVariableConfig[] {
		return BaseJsFunctionAssembler.create_variable_configs();
	}
	protected _reset_variable_configs() {
		this._variable_configs = undefined;
		this.variable_configs();
	}
	// input_names_for_shader_name(root_node: BaseJsNodeType) {
	// 	return this.shader_config(shader_name)?.input_names() || [];
	// }

	// time dependency
	protected _reset_uniforms_time_dependency() {
		this._uniforms_time_dependent = false;
	}
	set_uniforms_time_dependent() {
		this._uniforms_time_dependent = true;
	}
	uniforms_time_dependent(): boolean {
		return this._uniforms_time_dependent;
	}
}
