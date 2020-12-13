import lodash_compact from "lodash/compact";
import lodash_uniq from "lodash/uniq";
import {MapUtils as MapUtils2} from "../../../../core/MapUtils";
import {ShaderName as ShaderName2} from "./ShaderName";
import {NetworkChildNodeType} from "../../../poly/NodeContext";
export class TypedNodeTraverser {
  constructor(_parent_node, _shader_names, _input_names_for_shader_name_method) {
    this._parent_node = _parent_node;
    this._shader_names = _shader_names;
    this._input_names_for_shader_name_method = _input_names_for_shader_name_method;
    this._leaves_graph_id = new Map();
    this._graph_ids_by_shader_name = new Map();
    this._outputs_by_graph_id = new Map();
    this._depth_by_graph_id = new Map();
    this._graph_id_by_depth = new Map();
    this._graph = this._parent_node.scene.graph;
  }
  reset() {
    this._leaves_graph_id.clear();
    this._graph_ids_by_shader_name.clear();
    this._outputs_by_graph_id.clear();
    this._depth_by_graph_id.clear();
    this._graph_id_by_depth.clear();
    this._shader_names.forEach((shader_name) => {
      this._graph_ids_by_shader_name.set(shader_name, new Map());
    });
  }
  shader_names() {
    return this._shader_names;
  }
  input_names_for_shader_name(root_node, shader_name) {
    return this._input_names_for_shader_name_method(root_node, shader_name);
  }
  traverse(root_nodes) {
    this.reset();
    for (let shader_name of this.shader_names()) {
      this._leaves_graph_id.set(shader_name, new Map());
    }
    for (let shader_name of this.shader_names()) {
      this._shader_name = shader_name;
      for (let root_node of root_nodes) {
        this.find_leaves_from_root_node(root_node);
        this.set_nodes_depth();
      }
    }
    this._depth_by_graph_id.forEach((depth, graph_id) => {
      if (depth != null) {
        MapUtils2.push_on_array_at_entry(this._graph_id_by_depth, depth, graph_id);
      }
    });
  }
  leaves_from_nodes(nodes) {
    this._shader_name = ShaderName2.LEAVES_FROM_NODES_SHADER;
    this._graph_ids_by_shader_name.set(this._shader_name, new Map());
    this._leaves_graph_id.set(this._shader_name, new Map());
    for (let node of nodes) {
      this.find_leaves(node);
    }
    const node_ids = [];
    this._leaves_graph_id.get(this._shader_name)?.forEach((value, key) => {
      node_ids.push(key);
    });
    return this._graph.nodes_from_ids(node_ids);
  }
  nodes_for_shader_name(shader_name) {
    const depths = [];
    this._graph_id_by_depth.forEach((value, key) => {
      depths.push(key);
    });
    depths.sort((a, b) => a - b);
    const nodes = [];
    const node_id_used_state = new Map();
    depths.forEach((depth) => {
      const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
      if (graph_ids_for_depth) {
        graph_ids_for_depth.forEach((graph_id) => {
          const is_present = this._graph_ids_by_shader_name.get(shader_name)?.get(graph_id);
          if (is_present) {
            const node = this._graph.node_from_id(graph_id);
            this.add_nodes_with_children(node, node_id_used_state, nodes, shader_name);
          }
        });
      }
    });
    return nodes;
  }
  sorted_nodes() {
    const depths = [];
    this._graph_id_by_depth.forEach((ids, depth) => {
      depths.push(depth);
    });
    depths.sort((a, b) => a - b);
    const nodes = [];
    const node_id_used_state = new Map();
    depths.forEach((depth) => {
      const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
      if (graph_ids_for_depth) {
        for (let graph_id of graph_ids_for_depth) {
          const node = this._graph.node_from_id(graph_id);
          if (node) {
            this.add_nodes_with_children(node, node_id_used_state, nodes);
          }
        }
      }
    });
    return nodes;
  }
  add_nodes_with_children(node, node_id_used_state, accumulated_nodes, shader_name) {
    if (!node_id_used_state.get(node.graph_node_id)) {
      accumulated_nodes.push(node);
      node_id_used_state.set(node.graph_node_id, true);
    }
    if (node.type == NetworkChildNodeType.INPUT) {
      if (node.parent) {
        const nodes_with_same_parent_as_subnet_input = this.sorted_nodes_for_shader_name_for_parent(node.parent, shader_name);
        for (let child_node of nodes_with_same_parent_as_subnet_input) {
          if (child_node.graph_node_id != node.graph_node_id) {
            this.add_nodes_with_children(child_node, node_id_used_state, accumulated_nodes, shader_name);
          }
        }
      }
    }
  }
  sorted_nodes_for_shader_name_for_parent(parent, shader_name) {
    const depths = [];
    this._graph_id_by_depth.forEach((value, key) => {
      depths.push(key);
    });
    depths.sort((a, b) => a - b);
    const nodes = [];
    depths.forEach((depth) => {
      const graph_ids_for_depth = this._graph_id_by_depth.get(depth);
      if (graph_ids_for_depth) {
        graph_ids_for_depth.forEach((graph_id) => {
          const is_present = shader_name ? this._graph_ids_by_shader_name.get(shader_name)?.get(graph_id) : true;
          if (is_present) {
            const node = this._graph.node_from_id(graph_id);
            if (node.parent == parent) {
              nodes.push(node);
            }
          }
        });
      }
    });
    const first_node = nodes[0];
    if (parent.node_context() == first_node.node_context()) {
      nodes.push(parent);
    }
    return nodes;
  }
  find_leaves_from_root_node(root_node) {
    this._graph_ids_by_shader_name.get(this._shader_name)?.set(root_node.graph_node_id, true);
    const input_names = this.input_names_for_shader_name(root_node, this._shader_name);
    if (input_names) {
      for (let input_name of input_names) {
        const input = root_node.io.inputs.named_input(input_name);
        if (input) {
          MapUtils2.push_on_array_at_entry(this._outputs_by_graph_id, input.graph_node_id, root_node.graph_node_id);
          this.find_leaves(input);
        }
      }
    }
    this._outputs_by_graph_id.forEach((outputs, graph_id) => {
      this._outputs_by_graph_id.set(graph_id, lodash_uniq(outputs));
    });
  }
  find_leaves(node) {
    this._graph_ids_by_shader_name.get(this._shader_name)?.set(node.graph_node_id, true);
    const inputs = this._find_inputs_or_children(node);
    const compact_inputs = lodash_compact(inputs);
    const input_graph_ids = lodash_uniq(compact_inputs.map((n) => n.graph_node_id));
    const unique_inputs = input_graph_ids.map((graph_id) => this._graph.node_from_id(graph_id));
    if (unique_inputs.length > 0) {
      for (let input of unique_inputs) {
        MapUtils2.push_on_array_at_entry(this._outputs_by_graph_id, input.graph_node_id, node.graph_node_id);
        this.find_leaves(input);
      }
    } else {
      this._leaves_graph_id.get(this._shader_name).set(node.graph_node_id, true);
    }
  }
  _find_inputs_or_children(node) {
    if (node.type == NetworkChildNodeType.INPUT) {
      return node.parent?.io.inputs.inputs() || [];
    } else {
      if (node.children_allowed()) {
        const output_node = node.children_controller?.output_node();
        return [output_node];
      } else {
        return node.io.inputs.inputs();
      }
    }
  }
  set_nodes_depth() {
    this._leaves_graph_id.forEach((booleans_by_graph_id, shader_name) => {
      booleans_by_graph_id.forEach((boolean, graph_id) => {
        this.set_node_depth(graph_id);
      });
    });
  }
  set_node_depth(graph_id, depth = 0) {
    const current_depth = this._depth_by_graph_id.get(graph_id);
    if (current_depth != null) {
      this._depth_by_graph_id.set(graph_id, Math.max(current_depth, depth));
    } else {
      this._depth_by_graph_id.set(graph_id, depth);
    }
    const output_ids = this._outputs_by_graph_id.get(graph_id);
    if (output_ids) {
      output_ids.forEach((output_id) => {
        this.set_node_depth(output_id, depth + 1);
      });
    }
  }
}
