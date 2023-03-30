/**
 * returns the math function sqrt(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SqrtJsNode extends MathFunctionArg1OperationFactory('sqrt', {
	inputPrefix: 'val',
	out: 'sqrt',
}) {}
