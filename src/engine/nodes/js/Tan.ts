/**
 * returns the math function tan(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class TanJsNode extends MathFunctionArg1OperationFactory('tan', {
	inputPrefix: 'angle',
	out: 'tan',
}) {}
