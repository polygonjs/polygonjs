import {ParamJsonImporter} from '../Param';
import {ParamJsonExporterData} from '../../export/Param';
import {JsonImportDispatcher} from '../Dispatcher';
import {TypedMultipleParam} from 'src/engine/params/_Multiple';
import {ParamType} from 'src/engine/poly/ParamType';
import {FloatParam} from 'src/engine/params/Float';

export class ParamMultipleJsonImporter extends ParamJsonImporter<TypedMultipleParam<ParamType>> {
	add_main(data: ParamJsonExporterData) {
		const components = data['components'];
		if (components) {
			Object.keys(components).forEach((component_name) => {
				const param_name = `${this._param.name}${component_name}`;
				const component_param = this._param.node.params
					.get(this._param.name)
					?.components?.filter((c) => c.name == param_name)[0];
				if (component_param) {
					const component_data = components[component_name];
					JsonImportDispatcher.dispatch_param(component_param as FloatParam).process_data(component_data);
				}
			});
		}
	}
}
