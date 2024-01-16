import {ParamJsonExporter} from '../Param';
import {StringParam} from '../../../../params/String';
import {sanitizeExportedString} from '../sanitize';

export class ParamStringJsonExporter extends ParamJsonExporter<StringParam> {
	override add_main() {
		// let val = this._param.input_value();
		let val = this._param.rawInput();
		// if (isString(val)){
		val = sanitizeExportedString(val);
		// }
		if (this._require_data_complex()) {
			this._complex_data['raw_input'] = val;
		} else {
			return val;
		}
	}
}
