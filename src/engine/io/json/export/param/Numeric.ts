import {ParamJsonExporter} from '../Param';
import {TypedNumericParam} from 'src/engine/params/_Numeric';
import {ParamType} from 'src/engine/poly/ParamType';

export class ParamNumericJsonExporter extends ParamJsonExporter<TypedNumericParam<ParamType>> {
	add_main() {
		if (this._param.has_expression() && this._param.expression_controller?.expression) {
			// const escaped_expression = this._param.expression().replace(/'/g, "\\'");
			this._data['expression'] = this._param.expression_controller?.expression;
		} else {
			this._data['value'] = this._param.value_serialized;
		}
	}
}
