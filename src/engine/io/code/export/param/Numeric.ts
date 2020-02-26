import {ParamCodeExporter} from '../Param';
import {TypedNumericParam} from '../../../../params/_Numeric';
import {ParamType} from '../../../../poly/ParamType';

export class ParamNumericCodeExporter extends ParamCodeExporter<TypedNumericParam<ParamType>> {
	add_main() {
		if (this._param.has_expression() && this._param.expression_controller) {
			const escaped_expression = this._param.expression_controller.expression?.replace(/'/g, "\\'");
			this._lines.push(this.prefix() + `.set('${escaped_expression}')`);
		} else {
			this._lines.push(this.prefix() + `.set(${this._param.value})`);
		}
	}
}
