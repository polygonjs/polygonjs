import {ParamCodeExporter} from '../Param'

export class ParamNumericCodeExporter extends ParamCodeExporter {

	add_main() {
		if (this._param.has_expression()) {
			const escaped_expression = this._param.expression().replace(/'/g, "\\'");
			this._lines.push( this.prefix() + `.set_expression('${escaped_expression}')`)
		} else {
			this._lines.push( this.prefix() + `.set(${this._param.value()})` )
		}
	}



}
