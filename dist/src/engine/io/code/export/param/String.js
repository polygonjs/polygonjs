import lodash_isString from "lodash/isString";
import {ParamCodeExporter} from "../Param";
import {SceneCodeExporter} from "../Scene";
export class ParamStringCodeExporter extends ParamCodeExporter {
  as_code_default_value_string() {
    return `'${this._param.default_value}'`;
  }
  add_main() {
    let val = this._param.raw_input;
    if (lodash_isString(val)) {
      val = SceneCodeExporter.sanitize_string(val);
    }
    const line = this.prefix() + `.set('${val}')`;
    this._lines.push(line);
  }
}
