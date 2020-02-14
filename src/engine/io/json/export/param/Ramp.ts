import {ParamJsonExporter} from '../Param';
import {RampParam} from 'src/engine/params/Ramp';

export class ParamRampJsonExporter extends ParamJsonExporter<RampParam> {
	add_main() {
		this._data['raw_input'] = this._param.raw_input_serialized;
	}
}
