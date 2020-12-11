const ARGUMENTS_SEPARATOR = ", ";
import {BaseTraverser} from "./_Base";
export class ExpressionStringGenerator extends BaseTraverser {
  constructor(param) {
    super(param);
    this.param = param;
  }
  parse_tree(parsed_tree) {
    if (parsed_tree.error_message == null && parsed_tree.node) {
      try {
        return this.traverse_node(parsed_tree.node);
      } catch (e) {
        this.set_error("could not traverse tree");
      }
    } else {
      this.set_error("cannot parse tree");
    }
  }
  traverse_CallExpression(node) {
    const method_arguments = node.arguments.map((arg) => {
      return this.traverse_node(arg);
    });
    const arguments_joined = `${method_arguments.join(ARGUMENTS_SEPARATOR)}`;
    const method_name = node.callee.name;
    return `${method_name}(${arguments_joined})`;
  }
  traverse_UnaryExpression(node) {
    return `${node.operator}${this.traverse_node(node.argument)}`;
  }
  traverse_Identifier(node) {
    return `${node.name}`;
  }
}
