import {TypedParamVisitor} from './_Base';
import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

interface NumericParamVisitor extends TypedParamVisitor {
	visit_numeric_param: (param: TypedNumericParam<any>) => any;
}

export class TypedNumericParam<T extends ParamType> extends Single<T> {
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
