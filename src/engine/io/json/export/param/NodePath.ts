import {ParamJsonExporter} from '../Param';
import {NodePathParam} from '../../../../params/NodePath';
import {sanitizeExportedString} from '../sanitize';

export class ParamNodePathJsonExporter extends ParamJsonExporter<NodePathParam> {
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
