/**
 * returns the math function cos(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class CosJsNode extends MathFunctionArg1OperationFactory('cos', {
	inputPrefix: 'angle',
	out: 'cos',
}) {}
