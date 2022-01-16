import {ParamJsonExporter} from '../Param';
import {NodePathParam} from '../../../../params/NodePath';
import {SceneJsonExporter} from '../Scene';

export class ParamNodePathJsonExporter extends ParamJsonExporter<NodePathParam> {
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
