export class BaseExpressionRegister {
  constructor() {
    this._methods_by_name = new Map();
  }
  register_expression(expression, name) {
    this._methods_by_name.set(name, expression);
  }
  get_method(name) {
    return this._methods_by_name.get(name);
  }
}
