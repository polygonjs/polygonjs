import {VaryingWriteGlNode} from "../../VaryingWrite";
import {ParamGlNode} from "../../Param";
import {TextureGlNode} from "../../Texture";
import {RampGlNode} from "../../Ramp";
import {AttributeGlNode} from "../../Attribute";
import {IfThenGlNode} from "../../IfThen";
export class GlNodeFinder {
  static find_output_nodes(node) {
    const output_nodes = node.nodes_by_type("output");
    return output_nodes;
  }
  static find_param_generating_nodes(node) {
    const param_nodes = node.nodes_by_type(ParamGlNode.type());
    const texture_nodes = node.nodes_by_type(TextureGlNode.type());
    const ramp_nodes = node.nodes_by_type(RampGlNode.type());
    let all = param_nodes.concat(texture_nodes).concat(ramp_nodes);
    const if_then_nodes = node.nodes_by_type(IfThenGlNode.type());
    for (let if_then_node of if_then_nodes) {
      all = all.concat(this.find_param_generating_nodes(if_then_node));
    }
    return all;
  }
  static find_varying_nodes(node) {
    const nodes = node.nodes_by_type(VaryingWriteGlNode.type());
    return nodes;
  }
  static find_attribute_export_nodes(node) {
    const nodes = node.nodes_by_type(AttributeGlNode.type());
    return nodes.filter((node2) => {
      return node2.is_exporting;
    });
  }
}
