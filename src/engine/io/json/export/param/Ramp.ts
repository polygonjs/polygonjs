import {ParamJsonExporter} from '../Param';
import {RampParam} from 'src/engine/params/Ramp';

export class ParamRampJsonExporter extends ParamJsonExporter<RampParam> {
	add_main() {
		this._data['value'] = this._param.value.to_json();
	}
}
