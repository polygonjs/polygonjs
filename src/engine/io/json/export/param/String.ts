import {ParamJsonExporter} from '../Param';
import {SceneJsonExporter} from '../Scene';
import {StringParam} from '../../../../params/String';

export class ParamStringJsonExporter extends ParamJsonExporter<StringParam> {
	add_main() {
		// let val = this._param.input_value();
		let val = this._param.raw_input;
		// if (CoreType.isString(val)){
		val = SceneJsonExporter.sanitize_string(val);
		// }
		if (this._require_data_complex()) {
			this._complex_data['raw_input'] = val;
		} else {
			return val;
		}
	}
}
