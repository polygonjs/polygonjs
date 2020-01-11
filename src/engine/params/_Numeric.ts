import {TypedParamVisitor} from './_Base';
import {Single} from './_Single';

// import {AsCodeNumeric} from './concerns/visitors/Numeric';

// class BaseModules extends AsCodeNumeric(Single) {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, AsCodeNumeric.instance_methods);

interface NumericParamVisitor extends TypedParamVisitor {
	visit_numeric_param: (param: TypedNumericParam<any>) => any;
}

export class TypedNumericParam<T> extends Single<T> {
	// constructor() {
	// 	super();
	// }

	get is_numeric() {
		return true;
	}

	accepts_visitor(visitor: NumericParamVisitor): any {
		return visitor.visit_numeric_param(this);
	}
	// init_expression() {
	// 	if (this.is_value_expression(this._default_value)) {
	// 		return this.set_expression(this._default_value)
	// 	}
	// }
}
//else
//	@_value = @_default_value
