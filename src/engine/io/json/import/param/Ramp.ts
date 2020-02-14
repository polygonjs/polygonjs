import {ParamJsonImporter} from '../Param';
// import {RampValueJson} from 'src/engine/params/ramp/RampValue';
import {ParamJsonExporterData} from '../../export/Param';
import {RampParam} from 'src/engine/params/Ramp';
import {ParamType} from 'src/engine/poly/ParamType';

export class ParamRampJsonImporter extends ParamJsonImporter<RampParam> {
	add_main(data: ParamJsonExporterData<ParamType.RAMP>) {
		const raw_input = data['raw_input']; // as RampValueJson;
		if (raw_input) {
			// const ramp_value = RampValue.from_json(value);
			this._param.set(raw_input);
		}
	}
}
