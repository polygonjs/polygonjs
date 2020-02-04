import {ParamJsonImporter} from '../Param'
import {JsonImporterVisitor} from '../Visitor'

export class ParamMultipleJsonImporter extends ParamJsonImporter {

	add_main(data) {
		const components = data['components']
		if(components){
			Object.keys(components).forEach(component_name=>{
				const param_name = `${this._param.name()}${component_name}`
				const component_param = this._param.node().param(param_name)
				const component_data = components[component_name]
				component_param.visit(JsonImporterVisitor).process_data(component_data)
			})
		}
	}


}
