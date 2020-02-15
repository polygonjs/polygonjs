import lodash_isArray from 'lodash/isArray';
import lodash_isString from 'lodash/isString';
import {BaseParamType} from 'src/engine/params/_Base';
import {CodeExporterDispatcher} from './Dispatcher';
// import {ParamOptions} from 'src/engine/params/utils/OptionsController';

export class ParamCodeExporter<T extends BaseParamType> {
	_lines: string[] = [];
	constructor(protected _param: T) {}

	process(): string[] {
		this._lines = [];

		let default_value = this.default_value();
		if (lodash_isString(default_value)) {
			default_value = `'${default_value}'`;
		}
		if (lodash_isArray(default_value)) {
			default_value = `[${default_value}]`;
		}

		if (this._param.options.is_spare && !this._param.parent_param) {
			const create_line = `${this.node_var_name()}.add_param('${this._param.type}', '${
				this._param.name
			}', ${default_value}, ${JSON.stringify(this._param.options.current)})`;
			this._lines.push(create_line);
		}

		if (!this._param.is_default) {
			this.add_main();
		}
		this.add_options();

		return this._lines;
	}

	// as_code_default_value_string() {
	// 	return `${this.default_value()}`;
	// }
	// as_code_create() {
	// 	return `${this.node().code_var_name()}.add_spare_param( '${this.type()}', '${this.name()}', ${this.as_code_default_value_string()}, ${JSON.stringify(this.options())})`;
	// }

	default_value() {
		return this._param.default_value;
	}

	node_var_name() {
		return CodeExporterDispatcher.dispatch_node(this._param.node).var_name();
	}
	prefix() {
		return `${this.node_var_name()}.params.get('${this._param.name}')`;
	}

	protected add_main() {
		throw 'as_code_main abstract call';
	}

	add_options() {
		if (this._param.options.has_options_overridden) {
			const options_overridden = this._param.options.overridden_options;
			const keys = this._param.options.overridden_option_names;
			for (let option_name of keys) {
				const option_value = options_overridden[option_name];
				const line = this.prefix() + `.options.set('${option_name}', ${JSON.stringify(option_value)})`;
				this._lines.push(line);
			}
		}
	}
}
