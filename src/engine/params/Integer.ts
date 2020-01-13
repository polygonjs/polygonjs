// import lodash_isNumber from 'lodash/isNumber'
// import lodash_isBoolean from 'lodash/isBoolean'

import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';

export class IntegerParam extends TypedNumericParam<number> {
	// constructor() {
	// 	super();
	// }
	static type() {
		return ParamType.INTEGER;
	}

	// convert_value(v: ParamInputValue): number {
	// 	const converted_val = lodash_isBoolean(v)
	// 		? v
	// 			? 1
	// 			: 0
	// 		: lodash_isNumber(v)
	// 		? Math.round(v)
	// 		: Math.round(parseFloat(v))

	// 	return this._ensure_in_range(converted_val)
	// }

	// is_value_expression(v: number | string) {
	// 	//!lodash_isNumber(v)
	// 	// I was using parseInt before
	// 	// but that means that doing param.set(2.9) would set it to 2
	// 	return `${v}` !== `${Math.round(parseFloat(v))}`
	// }
	convert(raw_val: any): number {
		return parseInt(raw_val);
	}

	async eval() {
		const val = await this.eval_raw(); //val=> {
		const converted: number = this.convert(val);
		return converted;
		//});//
	}
}
