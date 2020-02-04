import lodash_isArray from 'lodash/isArray'
import lodash_isString from 'lodash/isString'
import {BaseParam} from 'src/Engine/Param/_Base'
import {CodeExporterVisitor} from './Visitor'

export class ParamCodeExporter {
	_lines: string[] = []
	constructor(protected _param: BaseParam){}

	process (): string[] {
		this._lines = []

		let default_value = this.default_value()
		if(lodash_isString(default_value)){
			default_value = `'${default_value}'`
		}
		if (lodash_isArray(default_value)){
			default_value = `[${default_value}]`
		}

		if(this._param.is_spare() && !this._param.parent_param()){
			const create_line = `${this.node_var_name()}.add_param('${this._param.type()}', '${this._param.name()}', ${default_value}, ${JSON.stringify(this._param.options())})`;
			this._lines.push(create_line)
		}

		if (!this._param.is_value_default()) {
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

	default_value(){
		return this._param.default_value()
	}

	node_var_name(){
		return this._param.node().visit(CodeExporterVisitor).var_name()
	}
	prefix() {
		return `${this.node_var_name()}.param('${this._param.name()}')`;
	}

	protected add_main() {
		throw "as_code_main abstract call";
	}



	add_options() {
		if (this._param.has_options_overridden()) {
			const options_overridden = this._param.overridden_options();
			for(let option_name of Object.keys(options_overridden)){
				const option_value = options_overridden[option_name];
				const line = this.prefix() + `.set_option('${option_name}', ${JSON.stringify(option_value)})`;
				this._lines.push(line);
			}
		}

	}

}

