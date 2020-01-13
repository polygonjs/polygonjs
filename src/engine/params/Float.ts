// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
// import lodash_isBoolean from 'lodash/isBoolean'
// import lodash_isNumber from 'lodash/isNumber'
import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';

export class FloatParam extends TypedNumericParam<number> {
	// constructor() {
	// 	super()
	// }
	static type() {
		return ParamType.FLOAT;
	}
	convert(raw_val: any): number {
		return parseFloat(raw_val);
	}
	// convert_value(v) {
	// 	// if(lodash_isNumber(v)){
	// 	// 	//
	// 	// }
	// 	if (lodash_isBoolean(v)) {
	// 		v = v ? 1 : 0
	// 	}
	// 	if (lodash_isString(v)) {
	// 		v = parseFloat(v)
	// 	}
	// 	if (lodash_isArray(v)) {
	// 		v = v[0]
	// 	}
	// 	return this._ensure_in_range(v)
	// }
	// convert_default_value(v) {
	// 	// if(lodash_isNumber(v)){
	// 	// 	//
	// 	// }
	// 	if (lodash_isBoolean(v)) {
	// 		v = v ? 1 : 0
	// 	}
	// 	// if(lodash_isString(v)){
	// 	// 	v = parseFloat(v)
	// 	// }
	// 	if (lodash_isArray(v)) {
	// 		v = v[0]
	// 	}
	// 	return v
	// }

	// is_value_expression(v) {
	// 	//console.log("is_value_expression", this, v, !lodash_isNumber(v))
	// 	//!lodash_isNumber(v)
	// 	return `${v}` !== `${parseFloat(v)}`
	// }
}
