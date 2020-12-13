export const OPERATIONS_COMPOSER_NODE_TYPE = "operations_composer";
export class BaseOperation {
  constructor(scene, states) {
    this.scene = scene;
    this.states = states;
  }
  static type() {
    throw "type to be overriden";
  }
  type() {
    const c = this.constructor;
    return c.type();
  }
  static context() {
    console.error("operation has no node_context", this);
    throw "context requires override";
  }
  context() {
    const c = this.constructor;
    return c.context();
  }
  cook(input_contents, params) {
  }
}
BaseOperation.DEFAULT_PARAMS = {};
BaseOperation.INPUT_CLONED_STATE = [];
