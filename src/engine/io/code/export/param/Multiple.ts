import {ParamCodeExporter} from '../Param';
import {CodeExporterDispatcher} from '../Dispatcher';
import {TypedMultipleParam} from 'src/engine/params/_Multiple';
import {ParamType} from 'src/engine/poly/ParamType';

export class ParamMultipleCodeExporter extends ParamCodeExporter<TypedMultipleParam<ParamType>> {
	as_code_default_value_string() {
		let values = this._param.components.map((c) => c.value);
		return `[${values.join(',')}]`;
	}
	add_main() {
		this._param.components.forEach((component) => {
			CodeExporterDispatcher.dispatch_param(component)
				.process()
				.forEach((component_line) => {
					this._lines.push(component_line);
				});
		});
	}
}
