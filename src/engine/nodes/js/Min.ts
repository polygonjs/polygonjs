/**
 * returns the min between 2 values
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {MathFunctionArg2OperationFactory, DEFAULT_ALLOWED_TYPES} from './_Math_Arg1Operation';

enum MinInput {
	src = 'src',
	min = 'min',
}
const DefaultValues: PolyDictionary<number> = {
	[MinInput.src]: 0,
	[MinInput.min]: 0,
};

export class MinJsNode extends MathFunctionArg2OperationFactory('min', {
	inputPrefix: 'in',
	out: 'min',
}) {
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [MinInput.src, MinInput.min][index];
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
