/**
 * returns the math function round(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class RoundJsNode extends MathFunctionArg1OperationFactory('round', {
	inputPrefix: 'val',
	out: 'round',
}) {}
