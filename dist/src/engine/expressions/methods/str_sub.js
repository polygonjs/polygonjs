import {BaseMethod} from "./_Base";
export class StrSubExpression extends BaseMethod {
  static required_arguments() {
    return [
      ["string", "string to get range from"],
      ["integer", "range start"],
      ["integer", "range size"]
    ];
  }
  async process_arguments(args) {
    let value = "";
    const string = args[0];
    const range_start = args[1] || 0;
    let range_size = args[2] || 1;
    if (string) {
      value = string.substr(range_start, range_size);
    }
    return value;
  }
}
