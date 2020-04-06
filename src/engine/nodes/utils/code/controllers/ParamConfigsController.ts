// import {ParamType} from '../../../../poly/ParamType';
// import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
// import {GlParamConfig} from '../../../gl/code/utils/ParamConfig';
import {ParamConfig} from '../../params/ParamsConfig';

export class ParamConfigsController<PC extends ParamConfig> {
	private _param_configs: PC[] = [];

	reset() {
		this._param_configs = [];
	}

	push(param_config: PC) {
		this._param_configs.push(param_config);
	}
	// create_and_push<T extends ParamType>(
	// 	type: T,
	// 	name: string,
	// 	default_value: ParamInitValuesTypeMap[T],
	// 	uniform_name: string
	// ) {
	// 	const param_config = new GlParamConfig(type, name, default_value, uniform_name);
	// 	console.log('new param_config', param_config);
	// 	this._param_configs.push(param_config);
	// }

	get list(): Readonly<PC[]> {
		return this._param_configs;
	}
}
