export class BaseExpressionRegister {
  constructor() {
    this._methods_by_name = new Map();
  }
  register(expression, name) {
    this._methods_by_name.set(name, expression);
  }
  getMethod(name) {
    return this._methods_by_name.get(name);
  }
}
