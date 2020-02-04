import {BaseParam} from 'src/Engine/Param/_Base'

export class ParamJsonImporter {
	constructor(
		private _param: BaseParam,
		){}

	process_data(data) {
		const value = data['value']
		const expression = data['expression']
		const components = data['components']
		if(expression !== undefined){this._param.set_expression(expression)}
		if(value !== undefined){
			this._param.set_value(value)
		}

		// const referenced_asset = data['referenced_asset']
		// if(referenced_asset){
		// 	this._param.mark_as_referencing_asset(referenced_asset)
		// }

		this.add_main(data)
	}

	add_main(){}


}

