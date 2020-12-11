import {BaseMethod} from "./_Base";
export class StrCharsCountExpression extends BaseMethod {
  static required_arguments() {
    return [["string", "string to count characters of"]];
  }
  async process_arguments(args) {
    let value = 0;
    if (args.length == 1) {
      const string = args[0];
      value = string.length;
    }
    return value;
  }
}
