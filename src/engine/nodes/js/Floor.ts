/**
 * returns the math function floor(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class FloorJsNode extends MathFunctionArg1OperationFactory('floor', {
	inputPrefix: 'val',
	out: 'floor',
}) {}
