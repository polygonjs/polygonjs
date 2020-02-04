import lodash_isString from 'lodash/isString'
import {ParamCodeExporter} from '../Param'
import {SceneCodeExporter} from '../Scene'

export class ParamStringCodeExporter extends ParamCodeExporter {

	as_code_default_value_string() {
		return `'${this._param.default_value()}'`;
	}

	add_main() {
		// if this.has_expression()
		// 	this.as_code_prefix() + ".set_expression('#{this.expression()}')"
		// else
		let val = this._param.input_string();
		if (lodash_isString(val)){
			val = SceneCodeExporter.sanitize_string(val)
		}
		// if (this._param.has_expression()){
		// 	val = this.expression()
		// }
		// if (lodash_isString(val)){
		// 	val = val.replace(/'/g, "\\'"); // escapes '
		// 	val = val.replace(/(\r\n|\n|\r)/gm, "\\n"); // escapes line breaks (for shader code for instance)
		// }
		const line = this.prefix() + `.set('${val}')`;
		this._lines.push(line)
	}


}
