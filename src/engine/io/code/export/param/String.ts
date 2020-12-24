import {ParamCodeExporter} from '../Param';
import {SceneCodeExporter} from '../Scene';
import {StringParam} from '../../../../params/String';
import { CoreType } from '../../../../../core/Type';

export class ParamStringCodeExporter extends ParamCodeExporter<StringParam> {
	as_code_default_value_string() {
		return `'${this._param.default_value}'`;
	}

	add_main() {
		// if this.has_expression()
		// 	this.as_code_prefix() + ".set_expression('#{this.expression()}')"
		// else
		let val = this._param.raw_input;
		if (CoreType.isString(val)) {
			val = SceneCodeExporter.sanitize_string(val);
		}
		// if (this._param.has_expression()){
		// 	val = this.expression()
		// }
		// if (CoreType.isString(val)){
		// 	val = val.replace(/'/g, "\\'"); // escapes '
		// 	val = val.replace(/(\r\n|\n|\r)/gm, "\\n"); // escapes line breaks (for shader code for instance)
		// }
		const line = this.prefix() + `.set('${val}')`;
		this._lines.push(line);
	}
}
