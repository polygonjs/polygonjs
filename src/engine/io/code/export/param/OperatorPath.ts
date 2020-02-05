import {ParamCodeExporter} from '../Param';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';

export class ParamOperatorPathCodeExporter extends ParamCodeExporter<OperatorPathParam> {
	as_code_default_value_string() {
		return `'${this._param.default_value}'`;
	}

	add_main() {
		let val = this._param.value;
		val = val.replace(/'/g, "\\'");
		const line = this.prefix() + `.set('${val}')`;
		this._lines.push(line);
	}
}
