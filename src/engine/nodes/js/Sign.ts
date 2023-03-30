/**
 * returns the math function sign(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SignJsNode extends MathFunctionArg1OperationFactory('sign', {
	inputPrefix: 'val',
	out: 'sign',
}) {}
