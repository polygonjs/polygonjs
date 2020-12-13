import {ParsedTree as ParsedTree2} from "./traversers/ParsedTree";
import {FunctionGenerator as FunctionGenerator2} from "./traversers/FunctionGenerator";
import {ExpressionStringGenerator as ExpressionStringGenerator2} from "./traversers/ExpressionStringGenerator";
import {DependenciesController as DependenciesController2} from "./DependenciesController";
import {ParamType as ParamType2} from "../poly/ParamType";
export class ExpressionManager {
  constructor(param) {
    this.param = param;
    this.parse_completed = false;
    this.parse_started = false;
    this.parsed_tree = new ParsedTree2();
    this.function_generator = new FunctionGenerator2(this.param);
    this.dependencies_controller = new DependenciesController2(this.param);
  }
  parse_expression(expression) {
    if (this.parse_started) {
      throw new Error(`parse in progress for param ${this.param.full_path()}`);
    }
    this.parse_started = true;
    this.parse_completed = false;
    this.parsed_tree = this.parsed_tree || new ParsedTree2();
    this.reset();
    if (this.param.type == ParamType2.STRING) {
      this.parsed_tree.parse_expression_for_string_param(expression);
    } else {
      this.parsed_tree.parse_expression(expression);
    }
    this.function_generator.parse_tree(this.parsed_tree);
    if (this.function_generator.error_message == null) {
      this.dependencies_controller.update(this.function_generator);
      if (this.dependencies_controller.error_message) {
        this.param.states.error.set(this.dependencies_controller.error_message);
      } else {
        this.parse_completed = true;
        this.parse_started = false;
      }
    }
  }
  async compute_function() {
    if (this.compute_allowed()) {
      try {
        const new_value = await this.function_generator.eval_function();
        return new_value;
      } catch (e) {
        return;
      }
    } else {
      return new Promise((resolve, reject) => {
        resolve(null);
      });
    }
  }
  reset() {
    this.parse_completed = false;
    this.parse_started = false;
    this.dependencies_controller.reset();
    this.function_generator.reset();
  }
  get is_errored() {
    return this.function_generator.is_errored;
  }
  get error_message() {
    return this.function_generator.error_message;
  }
  compute_allowed() {
    return this.function_generator.eval_allowed();
  }
  update_from_method_dependency_name_change() {
    this.expression_string_generator = this.expression_string_generator || new ExpressionStringGenerator2(this.param);
    const new_expression_string = this.expression_string_generator.parse_tree(this.parsed_tree);
    if (new_expression_string) {
      this.param.set(new_expression_string);
    } else {
      console.warn("failed to regenerate expression");
    }
  }
}
