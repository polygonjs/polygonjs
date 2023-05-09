/**
 * applies the math function atan(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AtanJsNode extends MathFunctionArg1OperationFactory('atan', {
	inputPrefix: 'val',
	out: 'atan',
}) {}
