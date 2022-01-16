// import {ParamJsonExporter} from '../Param';
// import {OperatorPathParam} from '../../../../params/OperatorPath';
// import {SceneJsonExporter} from '../Scene';

// export class ParamOperatorPathJsonExporter extends ParamJsonExporter<OperatorPathParam> {
// 	add_main() {
// 		let val = this._param.rawInput();
// 		// val = val.replace(/'/g, "\\'");
// 		val = SceneJsonExporter.sanitize_string(val);

// 		if (this._require_data_complex()) {
// 			this._complex_data['raw_input'] = val;
// 		} else {
// 			return val;
// 		}
// 	}
// }
