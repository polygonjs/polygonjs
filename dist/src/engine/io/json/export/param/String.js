import {ParamJsonExporter} from "../Param";
import {SceneJsonExporter} from "../Scene";
export class ParamStringJsonExporter extends ParamJsonExporter {
  add_main() {
    let val = this._param.raw_input;
    val = SceneJsonExporter.sanitize_string(val);
    if (this._require_data_complex()) {
      this._complex_data["raw_input"] = val;
    } else {
      return val;
    }
  }
}
