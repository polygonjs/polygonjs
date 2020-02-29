// import lodash_range from 'lodash/range';
// import lodash_compact from 'lodash/compact';
// import {BaseNodeGlBinaryNumeric} from './_BaseBinaryNumeric';
// import {Connection} from './GlData';

// export class Mult extends BaseNodeGlBinaryNumeric {
// 	static type() {
// 		return 'mult';
// 	}

// 	protected gl_output_name() {
// 		return 'product';
// 	}
// 	protected gl_input_default_value(name: string) {
// 		return 1;
// 	}
// 	protected gl_input_name(index = 0) {
// 		return `mult${index}`;
// 	}
// 	protected operation() {
// 		return '*';
// 	}

// 	constructor() {
// 		super();
// 	}

// 	protected output_connection_constructor() {
// 		return this.connection_constructor_from_connection(this.last_input_connection());
// 	}

// 	protected expected_named_input_constructors() {
// 		const constructor = this.input_connection_constructor();
// 		const count = Math.max(lodash_compact(this.input_connections()).length + 1, 2);

// 		if (this.first_input_connection()) {
// 			if (constructor == Connection.Float) {
// 				const second_connection = this.input_connection(1);
// 				if (second_connection) {
// 					const second_constructor = this.connection_constructor_from_connection(second_connection);
// 					if (second_constructor == Connection.Float) {
// 						// if first 2 inputs are float: n+1 float inputs
// 						return lodash_range(count).map((i) => constructor);
// 					} else {
// 						// if first input is float and 2nd is different: 1 float, 1 like second, and no other input
// 						return [constructor, second_constructor];
// 					}
// 				} else {
// 					// if only 1 input: 2 with same type
// 					return lodash_range(2).map((i) => constructor);
// 				}
// 			} else {
// 				// if first input is not a float: n+1 inputs with same type
// 				return lodash_range(count).map((i) => constructor);
// 			}
// 		} else {
// 			// if no inputs: 2 float inputs
// 			return lodash_range(2).map((i) => constructor);
// 		}
// 	}
// }
