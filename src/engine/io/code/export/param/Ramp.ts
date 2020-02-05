import {ParamCodeExporter} from '../Param';
import {RampParam} from 'src/engine/params/Ramp';

export class ParamRampCodeExporter extends ParamCodeExporter<RampParam> {
	default_value() {
		return JSON.stringify(this._param.default_value_serialized);
	}

	add_main() {
		let val = this._param.value;
		const json = val.to_json();
		const line = this.prefix() + `.set('${JSON.stringify(json)}')`;
		this._lines.push(line);
	}
}
