import {BaseParam} from 'src/Engine/Param/_Base'
import {ParamCodeExporter} from '../Param'
import {CodeExporterVisitor} from '../Visitor'

export class ParamMultipleCodeExporter extends ParamCodeExporter {

	_param: BaseParam

	as_code_default_value_string() {
		return `[${this._param.default_value().join(',')}]`;
	}
	add_main() {
		this._param.components().forEach(component=>{
			component.visit(CodeExporterVisitor).process().forEach( component_line=>{
				this._lines.push(component_line)
			})
		})
	}


}
