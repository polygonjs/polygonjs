import lodash_flatten from "lodash/flatten";
import lodash_uniq from "lodash/uniq";
import lodash_sortBy from "lodash/sortBy";
import {TextureAllocation as TextureAllocation2} from "./TextureAllocation";
import {TextureVariable as TextureVariable2} from "./TextureVariable";
import {ParticleShaderNames} from "../../../utils/shaders/ShaderName";
import {GlConnectionPointComponentsCountMap} from "../../../utils/io/connections/Gl";
import {AttributeGlNode} from "../../Attribute";
import {GlobalsGlNode} from "../../Globals";
import {OutputGlNode} from "../../Output";
const OUTPUT_NAME_ATTRIBUTES = ["position", "normal", "color", "uv"];
export class TextureAllocationsController {
  constructor() {
    this._allocations = [];
    this._next_allocation_index = 0;
  }
  allocate_connections_from_root_nodes(root_nodes, leaf_nodes) {
    const variables = [];
    for (let node of root_nodes) {
      const node_id = node.graph_node_id;
      switch (node.type) {
        case OutputGlNode.type(): {
          for (let connection_point of node.io.inputs.named_input_connection_points) {
            const input = node.io.inputs.named_input(connection_point.name);
            if (input) {
              const variable = new TextureVariable2(connection_point.name, GlConnectionPointComponentsCountMap[connection_point.type]);
              variable.add_graph_node_id(node_id);
              variables.push(variable);
            }
          }
          break;
        }
        case AttributeGlNode.type(): {
          const attrib_node = node;
          const named_input = attrib_node.connected_input_node();
          const connection_point = attrib_node.connected_input_connection_point();
          if (named_input && connection_point) {
            const variable = new TextureVariable2(attrib_node.attribute_name, GlConnectionPointComponentsCountMap[connection_point.type]);
            variable.add_graph_node_id(node_id);
            variables.push(variable);
          }
          break;
        }
      }
    }
    for (let node of leaf_nodes) {
      const node_id = node.graph_node_id;
      switch (node.type) {
        case GlobalsGlNode.type(): {
          const globals_node = node;
          for (let output_name of globals_node.io.outputs.used_output_names()) {
            const is_attribute = OUTPUT_NAME_ATTRIBUTES.includes(output_name);
            if (is_attribute) {
              const connection_point = globals_node.io.outputs.named_output_connection_points_by_name(output_name);
              if (connection_point) {
                const gl_type = connection_point.type;
                const variable = new TextureVariable2(output_name, GlConnectionPointComponentsCountMap[gl_type]);
                variable.add_graph_node_id(node_id);
                variables.push(variable);
              }
            }
          }
          break;
        }
        case AttributeGlNode.type(): {
          const attribute_node = node;
          const connection_point = attribute_node.output_connection_point();
          if (connection_point) {
            const variable = new TextureVariable2(attribute_node.attribute_name, GlConnectionPointComponentsCountMap[connection_point.type]);
            variable.add_graph_node_id(node_id);
            variables.push(variable);
          }
          break;
        }
      }
    }
    this.allocate_variables(variables);
  }
  allocate_variables(variables) {
    const variables_by_size_inverse = lodash_sortBy(variables, (variable) => {
      return -variable.size;
    });
    for (let variable of variables_by_size_inverse) {
      this.allocate_variable(variable);
    }
  }
  allocate_variable(new_variable) {
    let allocated = this.has_variable(new_variable.name);
    if (allocated) {
      const allocated_variable = this.variables().filter((v) => v.name == new_variable.name)[0];
      new_variable.graph_node_ids?.forEach((boolean, graph_node_id) => {
        allocated_variable.add_graph_node_id(graph_node_id);
      });
    } else {
      if (!allocated) {
        for (let allocation of this._allocations) {
          if (!allocated && allocation.has_space_for_variable(new_variable)) {
            allocation.add_variable(new_variable);
            allocated = true;
          }
        }
      }
      if (!allocated) {
        const new_allocation = new TextureAllocation2(this.next_allocation_name());
        this._allocations.push(new_allocation);
        new_allocation.add_variable(new_variable);
      }
    }
  }
  add_allocation(allocation) {
    this._allocations.push(allocation);
  }
  next_allocation_name() {
    const name = ParticleShaderNames[this._next_allocation_index];
    this._next_allocation_index += 1;
    return name;
  }
  shader_names() {
    const explicit_shader_names = this._allocations.map((a) => a.shader_name);
    return lodash_uniq(explicit_shader_names);
  }
  create_shader_configs() {
    return [];
  }
  allocation_for_shader_name(shader_name) {
    return this._allocations.filter((a) => a.shader_name == shader_name)[0];
  }
  input_names_for_shader_name(root_node, shader_name) {
    const allocation = this.allocation_for_shader_name(shader_name);
    if (allocation) {
      return allocation.input_names_for_node(root_node);
    }
  }
  variable(variable_name) {
    for (let allocation of this._allocations) {
      const variable = allocation.variable(variable_name);
      if (variable) {
        return variable;
      }
    }
  }
  variables() {
    return lodash_flatten(this._allocations.map((a) => a.variables || []));
  }
  has_variable(name) {
    const names = this.variables().map((v) => v.name);
    return names.includes(name);
  }
  static from_json(data) {
    const controller = new TextureAllocationsController();
    for (let datum of data) {
      const shader_name = Object.keys(datum)[0];
      const allocation_data = datum[shader_name];
      const new_allocation = TextureAllocation2.from_json(allocation_data, shader_name);
      controller.add_allocation(new_allocation);
    }
    return controller;
  }
  to_json(scene) {
    return this._allocations.map((allocation) => {
      const data = {
        [allocation.shader_name]: allocation.to_json(scene)
      };
      return data;
    });
  }
  print(scene) {
    console.log(JSON.stringify(this.to_json(scene), [""], 2));
  }
}
