import {BaseParamType} from 'src/engine/params/_Base';
import {ComplexParamJsonExporterData} from '../export/Param';
import {ParamType} from 'src/engine/poly/ParamType';

export class ParamJsonImporter<T extends BaseParamType> {
	constructor(protected _param: T) {}

	process_data(data: ComplexParamJsonExporterData<ParamType>) {
		const raw_input = data['raw_input'];
		// const expression = data['expression'];
		// const components = data['components'];
		// if (expression !== undefined) {
		// 	this._param.set(expression);
		// }
		if (raw_input !== undefined) {
			this._param.set(raw_input);
		}

		// const referenced_asset = data['referenced_asset']
		// if(referenced_asset){
		// 	this._param.mark_as_referencing_asset(referenced_asset)
		// }

		this.add_main(data);
	}

	add_main(data: ComplexParamJsonExporterData<ParamType>) {}
}
