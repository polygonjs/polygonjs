import {ParamJsonImporter} from '../Param';
import {RampValueJson} from 'src/engine/params/ramp/RampValue';
import {ParamJsonExporterData} from '../../export/Param';
import {RampParam} from 'src/engine/params/Ramp';

export class ParamRampJsonImporter extends ParamJsonImporter<RampParam> {
	add_main(data: ParamJsonExporterData) {
		let value = data['value'] as RampValueJson;
		if (value) {
			// const ramp_value = RampValue.from_json(value);
			this._param.set(value);
		}
	}
}
