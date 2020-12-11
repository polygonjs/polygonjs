import {ParamJsonImporter} from "../Param";
const LINE_BREAK_REGEXP = /\\n+/g;
export class ParamStringJsonImporter extends ParamJsonImporter {
  add_main(data) {
    let raw_input = data["raw_input"];
    if (raw_input !== void 0) {
      raw_input = raw_input.replace(LINE_BREAK_REGEXP, "\n");
      this._param.set(raw_input);
    }
  }
}
