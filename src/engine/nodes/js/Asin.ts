/**
 * applies the math function asin(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AsinJsNode extends MathFunctionArg1OperationFactory('asin', {
	inputPrefix: 'val',
	out: 'asin',
}) {}
