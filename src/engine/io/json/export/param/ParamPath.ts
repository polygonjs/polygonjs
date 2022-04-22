import {ParamJsonExporter} from '../Param';
import {ParamPathParam} from '../../../../params/ParamPath';
import {sanitizeExportedString} from '../sanitize';

export class ParamParamPathJsonExporter extends ParamJsonExporter<ParamPathParam> {
	override add_main() {
		let val = this._param.rawInput();
		// val = val.replace(/'/g, "\\'");
		val = sanitizeExportedString(val);

		if (this._require_data_complex()) {
			this._complex_data['raw_input'] = val;
		} else {
			return val;
		}
	}
}
