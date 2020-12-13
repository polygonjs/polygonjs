import {BaseMethod} from "./_Base";
import {DecomposedPath as DecomposedPath2} from "../../../core/DecomposedPath";
export class ChExpression extends BaseMethod {
  constructor() {
    super(...arguments);
    this._require_dependency = true;
  }
  static required_arguments() {
    return [["string", "path to param"]];
  }
  find_dependency(index_or_path) {
    const decomposed_path = new DecomposedPath2();
    const param = this.get_referenced_param(index_or_path, decomposed_path);
    if (param) {
      return this.create_dependency(param, index_or_path, decomposed_path);
    }
    return null;
  }
  async process_arguments(args) {
    let val = 0;
    if (args.length == 1) {
      const path = args[0];
      const ref = this.get_referenced_param(path);
      if (ref) {
        if (ref.is_dirty) {
          await ref.compute();
        }
        const result = ref.value;
        if (result != null) {
          val = result;
        }
      }
    }
    return val;
  }
}
