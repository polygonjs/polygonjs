import {JsVariableConfig} from "../configs/VariableConfig";
import {JsCodeBuilder} from "../utils/CodeBuilder";
import {TypedAssembler} from "../../../utils/shaders/BaseAssembler";
import {OutputJsNode} from "../../Output";
import {GlobalsJsNode} from "../../Globals";
import {AttributeJsNode} from "../../Attribute";
import {ParamJsNode} from "../../Param";
import {JsConnectionPoint, JsConnectionPointType} from "../../../utils/io/connections/Js";
export class BaseJsFunctionAssembler extends TypedAssembler {
  constructor(_js_parent_node) {
    super();
    this._js_parent_node = _js_parent_node;
    this._shaders_by_name = new Map();
    this._lines = new Map();
    this._root_nodes = [];
    this._leaf_nodes = [];
    this._uniforms_time_dependent = false;
  }
  get shader_names() {
    return [];
  }
  input_names_for_shader_name(node, shader_name) {
    return [];
  }
  async compile() {
  }
  compile_allowed() {
    return true;
  }
  _build_lines() {
  }
  set_root_nodes(root_nodes) {
    this._root_nodes = root_nodes;
  }
  root_nodes_by_shader_name(shader_name) {
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
        }
      }
    }
    return list;
  }
  leaf_nodes() {
    const list = [];
    for (let node of this._leaf_nodes) {
      switch (node.type) {
        case GlobalsJsNode.type(): {
          list.push(node);
          break;
        }
        case AttributeJsNode.type(): {
        }
      }
    }
    return list;
  }
  set_node_lines_globals(globals_node, lines_controller) {
  }
  set_node_lines_output(output_node, lines_controller) {
  }
  set_node_lines_attribute(attribute_node, lines_controller) {
  }
  get code_builder() {
    return this._code_builder = this._code_builder || new JsCodeBuilder(this, this._js_parent_node);
  }
  async build_code_from_nodes(root_nodes) {
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
  builder_lines(line_type) {
    return this.code_builder.lines(line_type);
  }
  all_builder_lines() {
    return this.code_builder.all_lines();
  }
  param_configs() {
    const code_builder = this._param_config_owner || this.code_builder;
    return code_builder.param_configs();
  }
  set_param_configs_owner(param_config_owner) {
    this._param_config_owner = param_config_owner;
    if (this._param_config_owner) {
      this.code_builder.disallow_new_param_configs();
    } else {
      this.code_builder.allow_new_param_configs();
    }
  }
  static add_output_inputs(output_child) {
  }
  add_output_inputs(output_child) {
    BaseJsFunctionAssembler.add_output_inputs(output_child);
  }
  static create_globals_node_output_connections() {
    return [
      new JsConnectionPoint("position", JsConnectionPointType.VEC3),
      new JsConnectionPoint("normal", JsConnectionPointType.VEC3),
      new JsConnectionPoint("color", JsConnectionPointType.VEC3),
      new JsConnectionPoint("uv", JsConnectionPointType.VEC2),
      new JsConnectionPoint("time", JsConnectionPointType.FLOAT)
    ];
  }
  create_globals_node_output_connections() {
    return BaseJsFunctionAssembler.create_globals_node_output_connections();
  }
  add_globals_outputs(globals_node) {
    globals_node.io.outputs.set_named_output_connection_points(this.create_globals_node_output_connections());
  }
  allow_attribute_exports() {
    return true;
  }
  reset_configs() {
    this._reset_variable_configs();
    this._reset_uniforms_time_dependency();
  }
  variable_configs() {
    return this._variable_configs = this._variable_configs || this.create_variable_configs();
  }
  set_variable_configs(variable_configs) {
    this._variable_configs = variable_configs;
  }
  variable_config(name) {
    return this.variable_configs().filter((vc) => {
      return vc.name() == name;
    })[0];
  }
  static create_variable_configs() {
    return [
      new JsVariableConfig("position"),
      new JsVariableConfig("normal"),
      new JsVariableConfig("color"),
      new JsVariableConfig("uv")
    ];
  }
  create_variable_configs() {
    return BaseJsFunctionAssembler.create_variable_configs();
  }
  _reset_variable_configs() {
    this._variable_configs = void 0;
    this.variable_configs();
  }
  _reset_uniforms_time_dependency() {
    this._uniforms_time_dependent = false;
  }
  set_uniforms_time_dependent() {
    this._uniforms_time_dependent = true;
  }
  uniforms_time_dependent() {
    return this._uniforms_time_dependent;
  }
}
