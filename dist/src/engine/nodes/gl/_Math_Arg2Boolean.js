import {BaseNodeGlMathFunctionArgBoolean2GlNode} from "./_BaseMathFunctionArgBoolean2";
function MathFunctionArg2BooleanFactory(type, options) {
  return class Node extends BaseNodeGlMathFunctionArgBoolean2GlNode {
    static type() {
      return type;
    }
    initialize_node() {
      super.initialize_node();
      this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
      this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
    }
    boolean_operation() {
      return options.op;
    }
    _gl_output_name(index) {
      return type;
    }
    _gl_input_name(index = 0) {
      return `${type}${index}`;
    }
  };
}
export class AndGlNode extends MathFunctionArg2BooleanFactory("and", {op: "&&"}) {
}
export class OrGlNode extends MathFunctionArg2BooleanFactory("or", {op: "||"}) {
}
