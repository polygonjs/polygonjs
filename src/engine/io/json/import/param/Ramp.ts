import {ParamJsonImporter} from '../Param';
// import {RampValueJson} from '../../../../params/ramp/RampValue';
import {ComplexParamJsonExporterData} from '../../export/Param';
import {RampParam} from '../../../../params/Ramp';
import {ParamType} from '../../../../poly/ParamType';

export class ParamRampJsonImporter extends ParamJsonImporter<RampParam> {
	add_main(data: ComplexParamJsonExporterData<ParamType.RAMP>) {
		const raw_input = data['raw_input']; // as RampValueJson;
		if (raw_input) {
			// const ramp_value = RampValue.from_json(value);
			this._param.set(raw_input);
		}
	}
}
