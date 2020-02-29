// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
import {BaseParamType} from '../../../params/_Base';
import {ParamType} from '../../../poly/ParamType';
import {ParamInitValueSerializedTypeMap} from '../../../params/types/ParamInitValueSerializedTypeMap';

import {ParamOptions} from '../../../params/utils/OptionsController';

type OverridenOptions = Dictionary<string>;

export type SimpleParamJsonExporterData<T extends ParamType> = ParamInitValueSerializedTypeMap[T];

export interface ComplexParamJsonExporterData<T extends ParamType> {
	type?: T;
	default_value?: ParamInitValueSerializedTypeMap[T];
	raw_input?: ParamInitValueSerializedTypeMap[T];
	options?: ParamOptions;
	overriden_options?: OverridenOptions;
	// components?: ParamJsonExporterDataByName;
	// expression?: string;
}
export type ParamJsonExporterData<T extends ParamType> =
	| SimpleParamJsonExporterData<T>
	| ComplexParamJsonExporterData<T>;
export type ParamJsonExporterDataByName = Dictionary<ParamJsonExporterData<ParamType>>;

export class ParamJsonExporter<T extends BaseParamType> {
	// protected _simple_data: SimpleParamJsonExporterData<ParamType>=0;
	protected _complex_data: ComplexParamJsonExporterData<ParamType> = {};
	constructor(protected _param: T) {}

	get required(): boolean {
		const is_spare_and_not_component = this._param.options.is_spare && !this._param.parent_param;

		// we should not need to check if it has an expression anymore,
		// as it could have an expression AND be of default value
		const value_changed = !this._param.is_default; //|| this._param.has_expression();
		// const referencing_asset = this._param.is_referencing_asset()
		return is_spare_and_not_component || value_changed; // || referencing_asset
	}

	data() {
		if (this._param.parent_param) {
			console.warn('no component should be saved');
			throw 'no component should be saved';
		}

		if (this._require_data_complex()) {
			return this._data_complex();
		} else {
			return this._data_simple();
		}
	}

	private _data_simple() {
		return this._param.raw_input_serialized;
	}

	private _data_complex() {
		this._complex_data = {};

		if (this._param.options.is_spare && !this._param.parent_param) {
			this._complex_data['type'] = this._param.type;
			this._complex_data['default_value'] = this._param.default_value_serialized;
			this._complex_data['raw_input'] = this._param.raw_input_serialized;
			this._complex_data['options'] = this._param.options.current;
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
			this._complex_data['overriden_options'] = overridden_options;
		}
		return this._complex_data;
	}

	protected _require_data_complex() {
		if (this._param.options.is_spare) {
			return true;
		}
		if (this._param.options.has_options_overridden) {
			return true;
		}
		return false;
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
