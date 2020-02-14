// import lodash_isString from 'lodash/isString'
import {ParamJsonExporter} from '../Param';
import {SceneJsonExporter} from '../Scene';
import {StringParam} from 'src/engine/params/String';

export class ParamStringJsonExporter extends ParamJsonExporter<StringParam> {
	add_main() {
		// let val = this._param.input_value();
		let val = this._param.raw_input;
		// if (lodash_isString(val)){
		val = SceneJsonExporter.sanitize_string(val);
		// }
		this._data['raw_input'] = val;
	}
}
