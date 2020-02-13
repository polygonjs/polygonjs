// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
import {BaseParamType} from 'src/engine/params/_Base';
import {ParamType} from 'src/engine/poly/ParamType';
import {ParamValueSerialized} from 'src/engine/params/types/ParamValueSerialized';

import {ParamOptions} from 'src/engine/params/utils/OptionsController';

type OverridenOptions = Dictionary<string>;

export type ParamJsonExporterDataByName = Dictionary<ParamJsonExporterData>;

export interface ParamJsonExporterData {
	type?: ParamType;
	default_value?: ParamValueSerialized;
	options?: ParamOptions;
	overriden_options?: OverridenOptions;
	components?: ParamJsonExporterDataByName;
	expression?: string;
	value?: ParamValueSerialized;
}

export class ParamJsonExporter<T extends BaseParamType> {
	protected _data: ParamJsonExporterData = {};
	constructor(protected _param: T) {}

	get required(): boolean {
		const is_spare_and_not_component = this._param.options.is_spare && !this._param.parent_param;
		const value_changed = !this._param.is_default || this._param.has_expression();
		// const referencing_asset = this._param.is_referencing_asset()
		return is_spare_and_not_component || value_changed; // || referencing_asset
	}

	data() {
		this._data = {};

		if (this._param.options.is_spare && !this._param.parent_param) {
			this._data['type'] = this._param.type;
			this._data['default_value'] = this._param.default_value_serialized;
			this._data['options'] = this._param.options.current;
		}

		if (!this._param.is_default) {
			this.add_main();
		}

		// if(this._param.is_referencing_asset()){
		// 	// console.log("this._param.is_referencing_asset()", this._param.is_referencing_asset())
		// 	this._data['referenced_asset'] = this._param.referenced_asset()
		// }

		if (this._param.options.has_options_overridden) {
			const overridden_options: OverridenOptions = {};
			const options_overridden = this._param.options.overridden_options;
			for (let option_name of Object.keys(options_overridden)) {
				const option_value = options_overridden[option_name as keyof ParamOptions];
				overridden_options[option_name] = JSON.stringify(option_value);
			}
			this._data['overriden_options'] = overridden_options;
		}

		return this._data;
	}

	// default_value(): ParamValueSerialized {
	// 	return this._param.default_value_serialized;
	// }

	// cannot remember why this is useful, but it messes up
	// with gl nodes like the noise node, as the default value
	// gets saved as a string '[1,1]' instead of an array [1,1] (should be without quotes)
	// protected default_value(){
	// 	let default_value = this._param.default_value()
	// 	if(lodash_isString(default_value)){
	// 		default_value = `'${default_value}'`
	// 	}
	// 	if (lodash_isArray(default_value)){
	// 		default_value = `[${default_value}]`
	// 	}
	// 	return default_value
	// }

	protected add_main() {}
}
