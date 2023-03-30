/**
 * returns the math function sin(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SinJsNode extends MathFunctionArg1OperationFactory('sin', {
	inputPrefix: 'angle',
	out: 'sin',
}) {}
