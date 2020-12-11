import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class NullSopOperation extends BaseSopOperation {
  static type() {
    return "null";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    if (core_group) {
      return core_group;
    } else {
      return this.create_core_group_from_objects([]);
    }
  }
}
NullSopOperation.DEFAULT_PARAMS = {};
NullSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
