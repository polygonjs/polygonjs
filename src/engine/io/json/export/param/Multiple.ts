import {ParamJsonExporter, ParamJsonExporterDataByName} from '../Param';
// import {JsonExporterVisitor} from '../Visitor';
import {TypedMultipleParam} from '../../../../params/_Multiple';
import {JsonExportDispatcher} from '../Dispatcher';

export class ParamMultipleJsonExporter extends ParamJsonExporter<TypedMultipleParam<any>> {
	add_main() {
		const components_data: ParamJsonExporterDataByName = {};
		const component_names = this._param.component_names;
		this._param.components?.forEach((component, i) => {
			const exporter = JsonExportDispatcher.dispatch_param(component); //.accepts_visitor();
			if (exporter.required) {
				components_data[component_names[i]] = exporter.data();
			}
		});

		return components_data;
	}
}
