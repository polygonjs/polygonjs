/**
 * returns the min between 2 values
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {
	// isJsConnectionPointPrimitive,
	JsConnectionPointType,
	JsConnectionPointTypeFromArrayTypeMap,
} from '../utils/io/connections/Js';
// import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {LocalFunctionJsDefinition} from './utils/JsDefinition';
import {
	MathFunctionArg2OperationFactory,
	DEFAULT_ALLOWED_TYPES,
	// functionDefinition,
	// FUNC_ARG_NAME,
} from './_Math_Arg1Operation';

// const MIN_FUNCTION_NAME = 'mathMin';
// const MIN_FUNCTION_BODY = `function ${MIN_FUNCTION_NAME}(src, min){
// 	return Math.min(src,min)
// }`;
enum MaxInput {
	src = 'src',
	max = 'max',
}
const DefaultValues: PolyDictionary<number> = {
	[MaxInput.src]: 0,
	[MaxInput.max]: 1,
};

export class MaxJsNode extends MathFunctionArg2OperationFactory('max', {
	inputPrefix: 'in',
	out: 'max',
}) {
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [MaxInput.src, MaxInput.max][index];
	}

	protected override _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		const connectionPoints =  this.io.inputs.namedInputConnectionPoints()
		if (first_input_type&&connectionPoints) {
			if (!DEFAULT_ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = connectionPoints[0];
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
