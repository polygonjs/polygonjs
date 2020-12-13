import {ParamCodeExporter} from "../Param";
export class ParamNodePathCodeExporter extends ParamCodeExporter {
  as_code_default_value_string() {
    return `'${this._param.default_value}'`;
  }
  add_main() {
    let val = this._param.value.path();
    val = val.replace(/'/g, "\\'");
    const line = this.prefix() + `.set('${val}')`;
    this._lines.push(line);
  }
}
