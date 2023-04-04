/**
 * returns value**exponent (the value at the power of the exponent)
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {MathFunctionArg2OperationFactory, DEFAULT_ALLOWED_TYPES} from './_Math_Arg1Operation';

enum PowInput {
	src = 'src',
	exp = 'exp',
}
const DefaultValues: PolyDictionary<number> = {
	[PowInput.src]: 0,
	[PowInput.exp]: 1,
};

export class PowJsNode extends MathFunctionArg2OperationFactory('pow', {
	inputPrefix: 'in',
	out: 'pow',
}) {
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [PowInput.src, PowInput.exp][index];
	}

	protected override _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		if (first_input_type) {
			if (!DEFAULT_ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = this.io.inputs.namedInputConnectionPoints()[0];
				if (first_connection) {
					first_input_type = first_connection.type();
				}
			}
		}
		const type = first_input_type || JsConnectionPointType.FLOAT;
		const boundType = JsConnectionPointTypeFromArrayTypeMap[type];
		return [type, boundType];
	}
}
