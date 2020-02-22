import {ParamConfig} from '../configs/ParamConfig';
import {ParamType} from 'src/engine/poly/ParamType';
import {ParamInitValuesTypeMap} from 'src/engine/params/types/ParamInitValuesTypeMap';

export class ParamConfigsController {
	private _param_configs: ParamConfig<ParamType>[] = [];

	reset() {
		this._param_configs = [];
	}

	push(param_config: ParamConfig<ParamType>) {
		this._param_configs.push(param_config);
	}
	create_and_push<T extends ParamType>(
		type: T,
		name: string,
		default_value: ParamInitValuesTypeMap[T],
		uniform_name: string
	) {
		const param_config = new ParamConfig(type, name, default_value, uniform_name);
		this._param_configs.push(param_config);
	}

	get list(): Readonly<ParamConfig<ParamType>[]> {
		return this._param_configs;
	}
}
