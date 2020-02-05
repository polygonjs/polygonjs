import {BaseParamType} from 'src/engine/params/_Base';
import {ParamJsonExporterData} from '../export/Param';

export class ParamJsonImporter<T extends BaseParamType> {
	constructor(protected _param: T) {}

	process_data(data: ParamJsonExporterData) {
		const value = data['value'];
		const expression = data['expression'];
		// const components = data['components'];
		if (expression !== undefined) {
			this._param.set(expression);
		}
		if (value !== undefined) {
			this._param.set(value);
		}

		// const referenced_asset = data['referenced_asset']
		// if(referenced_asset){
		// 	this._param.mark_as_referencing_asset(referenced_asset)
		// }

		this.add_main(data);
	}

	add_main(data: ParamJsonExporterData) {}
}
