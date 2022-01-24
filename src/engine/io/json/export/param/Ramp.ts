import {ParamJsonExporter} from '../Param';
import {RampParam} from '../../../../params/Ramp';

export class ParamRampJsonExporter extends ParamJsonExporter<RampParam> {
	override add_main() {
		if (this._require_data_complex()) {
			this._complex_data['raw_input'] = this._param.rawInputSerialized();
		} else {
			return this._param.rawInputSerialized();
		}
	}
}
