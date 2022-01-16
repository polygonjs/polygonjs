import {ParamJsonExporter} from '../Param';
import {ParamPathParam} from '../../../../params/ParamPath';
import {SceneJsonExporter} from '../Scene';

export class ParamParamPathJsonExporter extends ParamJsonExporter<ParamPathParam> {
	add_main() {
		let val = this._param.rawInput();
		// val = val.replace(/'/g, "\\'");
		val = SceneJsonExporter.sanitize_string(val);

		if (this._require_data_complex()) {
			this._complex_data['raw_input'] = val;
		} else {
			return val;
		}
	}
}
