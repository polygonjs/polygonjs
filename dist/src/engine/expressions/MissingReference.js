import {CoreWalker} from "../../core/Walker";
export class MissingExpressionReference {
  constructor(param, path) {
    this.param = param;
    this.path = path;
  }
  absolute_path() {
    return CoreWalker.make_absolute_path(this.param.node, this.path);
  }
  matches_path(path) {
    return this.absolute_path() == path;
  }
  update_from_method_dependency_name_change() {
    this.param.expression_controller?.update_from_method_dependency_name_change();
  }
  resolve_missing_dependencies() {
    const input = this.param.raw_input_serialized;
    this.param.set(this.param.default_value);
    this.param.set(input);
  }
}
