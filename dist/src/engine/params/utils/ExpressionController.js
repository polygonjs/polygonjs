import {ExpressionManager as ExpressionManager2} from "../../expressions/ExpressionManager";
export class ExpressionController {
  constructor(param) {
    this.param = param;
  }
  get active() {
    return this._expression != null;
  }
  get expression() {
    return this._expression;
  }
  get is_errored() {
    if (this._manager) {
      return this._manager.is_errored;
    }
    return false;
  }
  get error_message() {
    if (this._manager) {
      return this._manager.error_message;
    }
    return null;
  }
  get requires_entities() {
    return this.param.options.is_expression_for_entities;
  }
  set_expression(expression, set_dirty = true) {
    this.param.scene.missing_expression_references_controller.deregister_param(this.param);
    this.param.scene.expressions_controller.deregister_param(this.param);
    if (this._expression != expression) {
      this._expression = expression;
      if (this._expression) {
        this._manager = this._manager || new ExpressionManager2(this.param);
        this._manager.parse_expression(this._expression);
      } else {
        this._manager?.reset();
      }
      if (set_dirty) {
        this.param.set_dirty();
      }
    }
  }
  update_from_method_dependency_name_change() {
    if (this._manager && this.active) {
      this._manager.update_from_method_dependency_name_change();
    }
  }
  async compute_expression() {
    if (this._manager && this.active) {
      const result = await this._manager.compute_function();
      return result;
    }
  }
  async compute_expression_for_entities(entities, callback) {
    this.set_entities(entities, callback);
    await this.compute_expression();
    if (this._manager?.error_message) {
      this.param.node.states.error.set(`expression evalution error: ${this._manager?.error_message}`);
    }
    this.reset_entities();
  }
  compute_expression_for_points(entities, callback) {
    return this.compute_expression_for_entities(entities, callback);
  }
  compute_expression_for_objects(entities, callback) {
    return this.compute_expression_for_entities(entities, callback);
  }
  get entities() {
    return this._entities;
  }
  get entity_callback() {
    return this._entity_callback;
  }
  set_entities(entities, callback) {
    this._entities = entities;
    this._entity_callback = callback;
  }
  reset_entities() {
    this._entities = void 0;
    this._entity_callback = void 0;
  }
}
