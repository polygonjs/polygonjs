import {BaseParamType} from '../../../params/_Base';
import {
	ComplexParamJsonExporterData,
	ParamJsonExporterData,
	ParamsJsonExporterData,
	SimpleParamJsonExporterData,
	ParamsInitData,
} from '../../../nodes/utils/io/IOController';
import {ParamType} from '../../../poly/ParamType';

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

	static spare_params_data(params_data?: ParamsJsonExporterData) {
		return this.params_data(true, params_data);
	}

	static non_spare_params_data_value(params_data?: ParamsJsonExporterData): ParamsInitData | undefined {
		return this.params_data_value(false, params_data);
	}
	static params_data(spare: boolean, params_data?: ParamsJsonExporterData): ParamsJsonExporterData | undefined {
		let non_spare_params_data: ParamsJsonExporterData | undefined;
		if (params_data) {
			non_spare_params_data = {};
			const param_names = Object.keys(params_data);
			let param_data: ParamJsonExporterData<ParamType>;
			for (let param_name of param_names) {
				param_data = params_data[param_name];
				if (param_data) {
					non_spare_params_data[param_name] = params_data;
				}
			}
		}
		return non_spare_params_data;
	}
	private static params_data_value(spare: boolean, params_data?: ParamsJsonExporterData): ParamsInitData | undefined {
		let non_spare_params_data: ParamsInitData | undefined;
		if (params_data) {
			non_spare_params_data = {};
			const param_names = Object.keys(params_data);
			let param_data: ParamJsonExporterData<ParamType>;
			for (let param_name of param_names) {
				param_data = params_data[param_name];
				if (param_data != null) {
					const options = (param_data as ComplexParamJsonExporterData<ParamType>).options;
					const overriden_options = (param_data as ComplexParamJsonExporterData<ParamType>).overriden_options;
					if (options || overriden_options) {
						const complex_data = param_data as ComplexParamJsonExporterData<ParamType>;
						if (options && options.spare == spare) {
							if (complex_data.raw_input != null) {
								non_spare_params_data[param_name] = {complex_data: complex_data};
							}
						} else {
							// TODO: THIS IS A MESS
							if (overriden_options) {
								non_spare_params_data[param_name] = {complex_data: complex_data};
							}
						}
					} else {
						// TODO: THIS IS A MESS
						const simple_data = param_data as SimpleParamJsonExporterData<ParamType>;
						if (overriden_options || simple_data != null) {
							non_spare_params_data[param_name] = {
								simple_data: simple_data,
							};
						}
					}
				}
			}
		}
		return non_spare_params_data;
	}
}
