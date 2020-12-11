import {ParamCodeExporter} from "../Param";
export class ParamNumericCodeExporter extends ParamCodeExporter {
  add_main() {
    if (this._param.has_expression() && this._param.expression_controller) {
      const escaped_expression = this._param.expression_controller.expression?.replace(/'/g, "\\'");
      this._lines.push(this.prefix() + `.set('${escaped_expression}')`);
    } else {
      this._lines.push(this.prefix() + `.set(${this._param.value})`);
    }
  }
}
