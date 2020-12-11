import {BaseMethod} from "./_Base";
export class StrConcatExpression extends BaseMethod {
  static required_arguments() {
    return [];
  }
  async process_arguments(args) {
    let value = "";
    for (let arg of args) {
      if (arg == null) {
        arg = "";
      }
      value += `${arg}`;
    }
    return value;
  }
}
