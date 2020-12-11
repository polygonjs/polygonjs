import {BaseMethod} from "./_Base";
export class StrIndexExpression extends BaseMethod {
  static required_arguments() {
    return [
      ["string", "string to get index from"],
      ["string", "char to find index of"]
    ];
  }
  async process_arguments(args) {
    let value = -1;
    if (args.length == 2) {
      const string = args[0];
      const sub_string = args[1];
      value = string.indexOf(sub_string);
    }
    return value;
  }
}
