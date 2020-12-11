import {ParamJsonImporter} from "../Param";
export class ParamRampJsonImporter extends ParamJsonImporter {
  add_main(data) {
    const raw_input = data["raw_input"];
    if (raw_input) {
      this._param.set(raw_input);
    }
  }
}
