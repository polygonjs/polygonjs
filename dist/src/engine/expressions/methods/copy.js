import {BaseMethod} from "./_Base";
import {CoreWalker} from "../../../core/Walker";
import {CopySopNode} from "../../nodes/sop/Copy";
export class CopyExpression extends BaseMethod {
  constructor() {
    super(...arguments);
    this._require_dependency = true;
  }
  static required_arguments() {
    return [
      ["string", "path to copy"],
      ["integer", "default value"]
    ];
  }
  static optional_arguments() {
    return [["string", "attribute name (optional)"]];
  }
  find_dependency(index_or_path) {
    const node = this.find_referenced_graph_node(index_or_path);
    if (node && node.type == "copy") {
      const stamp_node = node.stamp_node;
      return this.create_dependency(stamp_node, index_or_path);
    }
    return null;
  }
  process_arguments(args) {
    return new Promise((resolve, reject) => {
      if (args.length == 2 || args.length == 3) {
        const path = args[0];
        const default_value = args[1];
        const attribute_name = args[2];
        const node = this.node ? CoreWalker.find_node(this.node, path) : null;
        let value;
        if (node && node.type == CopySopNode.type()) {
          value = node.stamp_value(attribute_name);
        }
        if (value == null) {
          value = default_value;
        }
        resolve(value);
      } else {
        resolve(0);
      }
    });
  }
}
