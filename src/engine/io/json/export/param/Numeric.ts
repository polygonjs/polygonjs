import {ParamJsonExporter} from '../Param';
import {TypedNumericParam} from '../../../../params/_Numeric';
import {ParamType} from '../../../../poly/ParamType';

export class ParamNumericJsonExporter extends ParamJsonExporter<TypedNumericParam<ParamType>> {
	override add_main() {
		// if (this._param.hasExpression() && this._param.expressionController?.expression) {
		// 	// const escaped_expression = this._param.expression().replace(/'/g, "\\'");
		// 	this._data['expression'] = this._param.expressionController?.expression;
		// } else {
		if (this._require_data_complex()) {
			this._complex_data['raw_input'] = this._param.rawInputSerialized();
		} else {
			return this._param.rawInputSerialized();
		}
		// }
	}
}
