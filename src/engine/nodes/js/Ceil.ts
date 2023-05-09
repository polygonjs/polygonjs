/**
 * returns the math function ceil(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class CeilJsNode extends MathFunctionArg1OperationFactory('ceil', {
	inputPrefix: 'val',
	out: 'ceil',
}) {}
