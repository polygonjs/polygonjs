import lodash_uniq from "lodash/uniq";
import {MapUtils as MapUtils2} from "../../../../../core/MapUtils";
import {GLDefinitionType} from "../../utils/GLDefinition";
import {TypedGLDefinitionCollection} from "../../utils/GLDefinitionCollection";
import {ParamConfigsController as ParamConfigsController2} from "../../../../nodes/utils/code/controllers/ParamConfigsController";
import {ShadersCollectionController as ShadersCollectionController2} from "./ShadersCollectionController";
import {CodeFormatter as CodeFormatter2} from "./CodeFormatter";
import {LineType as LineType2} from "./LineType";
export class CodeBuilder {
  constructor(_node_traverser, _root_nodes_for_shader_method) {
    this._node_traverser = _node_traverser;
    this._root_nodes_for_shader_method = _root_nodes_for_shader_method;
    this._param_configs_controller = new ParamConfigsController2();
    this._param_configs_set_allowed = true;
    this._lines = new Map();
  }
  shader_names() {
    return this._node_traverser.shader_names();
  }
  build_from_nodes(root_nodes, param_nodes) {
    this._node_traverser.traverse(root_nodes);
    const nodes_by_shader_name = new Map();
    for (let shader_name of this.shader_names()) {
      const nodes = this._node_traverser.nodes_for_shader_name(shader_name);
      nodes_by_shader_name.set(shader_name, nodes);
    }
    const sorted_nodes = this._node_traverser.sorted_nodes();
    for (let shader_name of this.shader_names()) {
      const root_nodes_for_shader = this._root_nodes_for_shader_method(shader_name);
      for (let root_node of root_nodes_for_shader) {
        MapUtils2.push_on_array_at_entry(nodes_by_shader_name, shader_name, root_node);
      }
    }
    const sorted_node_ids = new Map();
    for (let node of sorted_nodes) {
      sorted_node_ids.set(node.graph_node_id, true);
    }
    for (let root_node of root_nodes) {
      if (!sorted_node_ids.get(root_node.graph_node_id)) {
        sorted_nodes.push(root_node);
        sorted_node_ids.set(root_node.graph_node_id, true);
      }
    }
    for (let node of sorted_nodes) {
      node.reset_code();
    }
    for (let node of param_nodes) {
      node.reset_code();
    }
    this._shaders_collection_controller = new ShadersCollectionController2(this.shader_names(), this.shader_names()[0]);
    this.reset();
    for (let shader_name of this.shader_names()) {
      const nodes = lodash_uniq(nodes_by_shader_name.get(shader_name));
      this._shaders_collection_controller.set_current_shader_name(shader_name);
      if (nodes) {
        for (let node of nodes) {
          node.set_lines(this._shaders_collection_controller);
        }
      }
    }
    if (this._param_configs_set_allowed) {
      for (let param_node of param_nodes) {
        param_node.set_param_configs();
      }
      this.set_param_configs(param_nodes);
    }
    this.set_code_lines(sorted_nodes);
  }
  shaders_collection_controller() {
    return this._shaders_collection_controller;
  }
  disallow_new_param_configs() {
    this._param_configs_set_allowed = false;
  }
  allow_new_param_configs() {
    this._param_configs_set_allowed = true;
  }
  reset() {
    for (let shader_name of this.shader_names()) {
      const lines_map = new Map();
      this._lines.set(shader_name, lines_map);
    }
  }
  param_configs() {
    return this._param_configs_controller.list || [];
  }
  lines(shader_name, line_type) {
    return this._lines.get(shader_name)?.get(line_type) || [];
  }
  all_lines() {
    return this._lines;
  }
  set_param_configs(nodes) {
    this._param_configs_controller.reset();
    for (let node of nodes) {
      const param_configs = node.param_configs();
      if (param_configs) {
        for (let param_config of param_configs) {
          this._param_configs_controller.push(param_config);
        }
      }
    }
  }
  set_code_lines(nodes) {
    for (let shader_name of this.shader_names()) {
      this.add_code_lines(nodes, shader_name);
    }
  }
  add_code_lines(nodes, shader_name) {
    this.add_definitions(nodes, shader_name, GLDefinitionType.FUNCTION, LineType2.FUNCTION_DECLARATION);
    this.add_definitions(nodes, shader_name, GLDefinitionType.UNIFORM, LineType2.DEFINE);
    this.add_definitions(nodes, shader_name, GLDefinitionType.VARYING, LineType2.DEFINE);
    this.add_definitions(nodes, shader_name, GLDefinitionType.ATTRIBUTE, LineType2.DEFINE);
    this.add_code_line_for_nodes_and_line_type(nodes, shader_name, LineType2.BODY);
  }
  add_definitions(nodes, shader_name, definition_type, line_type) {
    if (!this._shaders_collection_controller) {
      return;
    }
    const definitions = [];
    for (let node of nodes) {
      let node_definitions = this._shaders_collection_controller.definitions(shader_name, node);
      if (node_definitions) {
        node_definitions = node_definitions.filter((d) => d.definition_type == definition_type);
        for (let definition of node_definitions) {
          definitions.push(definition);
        }
      }
    }
    if (definitions.length > 0) {
      const collection = new TypedGLDefinitionCollection(definitions);
      const uniq_definitions = collection.uniq();
      if (collection.errored) {
        throw `code builder error: ${collection.error_message}`;
      }
      const definitions_by_node_id = new Map();
      const node_ids = new Map();
      for (let definition of uniq_definitions) {
        const node_id = definition.node.graph_node_id;
        if (!node_ids.has(node_id)) {
          node_ids.set(node_id, true);
        }
        MapUtils2.push_on_array_at_entry(definitions_by_node_id, node_id, definition);
      }
      const lines_for_shader = this._lines.get(shader_name);
      node_ids.forEach((_, node_id) => {
        const definitions2 = definitions_by_node_id.get(node_id);
        if (definitions2) {
          const first_definition = definitions2[0];
          if (first_definition) {
            const comment = CodeFormatter2.node_comment(first_definition.node, line_type);
            MapUtils2.push_on_array_at_entry(lines_for_shader, line_type, comment);
            for (let definition of definitions2) {
              const line = CodeFormatter2.line_wrap(first_definition.node, definition.line, line_type);
              MapUtils2.push_on_array_at_entry(lines_for_shader, line_type, line);
            }
            const separator = CodeFormatter2.post_line_separator(line_type);
            MapUtils2.push_on_array_at_entry(lines_for_shader, line_type, separator);
          }
        }
      });
    }
  }
  add_code_line_for_nodes_and_line_type(nodes, shader_name, line_type) {
    nodes = nodes.filter((node) => {
      if (this._shaders_collection_controller) {
        const lines = this._shaders_collection_controller.body_lines(shader_name, node);
        return lines && lines.length > 0;
      }
    });
    var nodes_count = nodes.length;
    for (let i = 0; i < nodes_count; i++) {
      const is_last = i == nodes.length - 1;
      this.add_code_line_for_node_and_line_type(nodes[i], shader_name, line_type, is_last);
    }
  }
  add_code_line_for_node_and_line_type(node, shader_name, line_type, is_last) {
    if (!this._shaders_collection_controller) {
      return;
    }
    const lines = this._shaders_collection_controller.body_lines(shader_name, node);
    if (lines && lines.length > 0) {
      const lines_for_shader = this._lines.get(shader_name);
      const comment = CodeFormatter2.node_comment(node, line_type);
      MapUtils2.push_on_array_at_entry(lines_for_shader, line_type, comment);
      lodash_uniq(lines).forEach((line) => {
        line = CodeFormatter2.line_wrap(node, line, line_type);
        MapUtils2.push_on_array_at_entry(lines_for_shader, line_type, line);
      });
      if (!(line_type == LineType2.BODY && is_last)) {
        const separator = CodeFormatter2.post_line_separator(line_type);
        MapUtils2.push_on_array_at_entry(lines_for_shader, line_type, separator);
      }
    }
  }
}
