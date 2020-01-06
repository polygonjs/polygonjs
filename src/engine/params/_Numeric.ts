import {Single} from './_Single'

import {AsCodeNumeric} from './concerns/visitors/Numeric'

// class BaseModules extends AsCodeNumeric(Single) {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, AsCodeNumeric.instance_methods);

export class NumericParam<T> extends AsCodeNumeric(Single)<T> {
	constructor() {
		super()
	}

	is_numeric() {
		return true
	}

	// init_expression() {
	// 	if (this.is_value_expression(this._default_value)) {
	// 		return this.set_expression(this._default_value)
	// 	}
	// }
}
//else
//	@_value = @_default_value
