import {ParamCodeExporter} from "../Param";
import {CodeExporterDispatcher} from "../Dispatcher";
export class ParamMultipleCodeExporter extends ParamCodeExporter {
  as_code_default_value_string() {
    let values = this._param.components.map((c) => c.value);
    return `[${values.join(",")}]`;
  }
  add_main() {
    this._param.components.forEach((component) => {
      CodeExporterDispatcher.dispatch_param(component).process().forEach((component_line) => {
        this._lines.push(component_line);
      });
    });
  }
}
