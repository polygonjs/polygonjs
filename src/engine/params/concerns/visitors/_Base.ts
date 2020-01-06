// import lodash_flatten from 'lodash/flatten'
// import lodash_compact from 'lodash/compact'
// import lodash_keys from 'lodash/keys'
// import lodash_each from 'lodash/each'
// import {BaseParam} from 'src/engine/params/_Base'
interface BaseParamVisitor {
	visit_param: (param: any) => void
}

export function VisitorsBase<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		visit(visitor: BaseParamVisitor) {
			return visitor.visit_param(this)
		}

		// as_code_default_value_string() {
		// 	return `${this.default_value()}`;
		// }
		// as_code_create() {
		// 	return `${this.node().code_var_name()}.add_spare_param( '${this.type()}', '${this.name()}', ${this.as_code_default_value_string()}, ${JSON.stringify(this.options())})`;
		// }
		// as_code_prefix() {
		// 	return `${this.node().code_var_name()}.any_param('${this.name()}')`;
		// }

		// as_code_main() {
		// 	throw "as_code_main abstract call";
		// }

		// as_code_options() {
		// 	const lines = [];
		// 	if (this.has_options_overridden()) {
		// 		const options_overridden = this.overridden_options();
		// 		lodash_each(lodash_keys(options_overridden), option_name=> {
		// 			const option_value = options_overridden[option_name];
		// 			const line = this.as_code_prefix() + `.set_option('${option_name}', ${JSON.stringify(option_value)})`;
		// 			return lines.push(line);
		// 		});
		// 	}

		// 	return lines;
		// }

		// as_code() {
		// 	const lines = [];
		// 	if (!this.is_value_default()) {
		// 		lines.push(this.as_code_main());
		// 	}
		// 	lines.push(this.as_code_options());

		// 	return lodash_compact(lodash_flatten(lines));
		// }
	}
}
