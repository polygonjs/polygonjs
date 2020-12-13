import {TextureVariable as TextureVariable2} from "./TextureVariable";
import {AttributeGlNode} from "../../Attribute";
import {GlNodeType} from "../../../../poly/NodeContext";
const TEXTURE_PREFIX = "texture_";
export class TextureAllocation {
  constructor(_shader_name) {
    this._shader_name = _shader_name;
    this._size = 0;
  }
  add_variable(variable) {
    this._variables = this._variables || [];
    this._variables.push(variable);
    variable.set_position(this._size);
    variable.set_allocation(this);
    this._size += variable.size;
  }
  has_space_for_variable(variable) {
    return this._size + variable.size <= 4;
  }
  get size() {
    return this._size;
  }
  get shader_name() {
    return this._shader_name;
  }
  get texture_name() {
    return `${TEXTURE_PREFIX}${this._shader_name}`;
  }
  get variables() {
    return this._variables;
  }
  variables_for_input_node(root_node) {
    return this._variables?.filter((variable) => variable.graph_node_ids?.has(root_node.graph_node_id) || false);
  }
  input_names_for_node(root_node) {
    const variables = this.variables_for_input_node(root_node);
    if (variables) {
      if (root_node.type == GlNodeType.ATTRIBUTE) {
        return [AttributeGlNode.INPUT_NAME];
      } else {
        return variables.map((v) => v.name);
      }
    }
  }
  variable(variable_name) {
    if (this._variables) {
      for (let variable of this._variables) {
        if (variable.name == variable_name) {
          return variable;
        }
      }
    }
  }
  static from_json(data, shader_name) {
    const texture_allocation = new TextureAllocation(shader_name);
    for (let datum of data) {
      const texture_variable = TextureVariable2.from_json(datum);
      texture_allocation.add_variable(texture_variable);
    }
    return texture_allocation;
  }
  to_json(scene) {
    if (this._variables) {
      return this._variables.map((v) => v.to_json(scene));
    } else {
      return [];
    }
  }
}
