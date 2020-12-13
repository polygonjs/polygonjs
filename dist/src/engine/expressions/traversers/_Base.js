import lodash_isString from "lodash/isString";
export const VARIABLE_PREFIX = "$";
export class BaseTraverser {
  constructor(param) {
    this.param = param;
    this._set_error_from_error_bound = this._set_error_from_error.bind(this);
  }
  clear_error() {
    this._error_message = void 0;
  }
  set_error(message) {
    this._error_message = this._error_message || message;
  }
  _set_error_from_error(error) {
    if (lodash_isString(error)) {
      this._error_message = error;
    } else {
      this._error_message = error.message;
    }
  }
  get is_errored() {
    return this._error_message != null;
  }
  get error_message() {
    return this._error_message;
  }
  reset() {
    this._error_message = void 0;
  }
  traverse_node(node) {
    const method_name = `traverse_${node.type}`;
    const method = this[method_name];
    if (method) {
      return this[method_name](node);
    } else {
      this.set_error(`expression unknown node type: ${node.type}`);
    }
  }
  traverse_BinaryExpression(node) {
    return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
  }
  traverse_LogicalExpression(node) {
    return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
  }
  traverse_MemberExpression(node) {
    return `${this.traverse_node(node.object)}.${this.traverse_node(node.property)}`;
  }
  traverse_ConditionalExpression(node) {
    return `(${this.traverse_node(node.test)}) ? (${this.traverse_node(node.consequent)}) : (${this.traverse_node(node.alternate)})`;
  }
  traverse_Compound(node) {
    const args = node.body;
    let traversed_args = [];
    for (let i = 0; i < args.length; i++) {
      const arg_node = args[i];
      if (arg_node.type == "Identifier") {
        if (arg_node.name[0] == VARIABLE_PREFIX) {
          traversed_args.push("`${" + this.traverse_node(arg_node) + "}`");
        } else {
          traversed_args.push(`'${arg_node.name}'`);
        }
      } else {
        traversed_args.push("`${" + this.traverse_node(arg_node) + "}`");
      }
    }
    return traversed_args.join(" + ");
  }
  traverse_Literal(node) {
    return `${node.raw}`;
  }
}
