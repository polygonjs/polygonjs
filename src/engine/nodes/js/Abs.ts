/**
 * applies the math function abs(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AbsJsNode extends MathFunctionArg1OperationFactory('abs', {
	inputPrefix: 'val',
	out: 'abs',
}) {}
