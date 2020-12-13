export class ParamSerializer {
  constructor(param) {
    this.param = param;
  }
  to_json() {
    const data = {
      name: this.param.name,
      type: this.param.type,
      raw_input: this.raw_input(),
      value: this.value(),
      value_pre_conversion: this.value_pre_conversion(),
      expression: this.expression(),
      graph_node_id: this.param.graph_node_id,
      error_message: this.error_message(),
      is_visible: this.is_visible(),
      components: void 0
    };
    if (this.param.is_multiple && this.param.components) {
      data["components"] = this.param.components.map((component) => component.graph_node_id);
    }
    return data;
  }
  raw_input() {
    return this.param.raw_input_serialized;
  }
  value() {
    return this.param.value_serialized;
  }
  value_pre_conversion() {
    return this.param.value_pre_conversion_serialized;
  }
  expression() {
    return this.param.has_expression() ? this.param.expression_controller?.expression : void 0;
  }
  error_message() {
    return this.param.states.error.message;
  }
  is_visible() {
    return this.param.options.is_visible;
  }
}
