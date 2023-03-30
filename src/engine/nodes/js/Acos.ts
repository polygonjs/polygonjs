/**
 * applies the math function acos(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AcosJsNode extends MathFunctionArg1OperationFactory('acos', {
	inputPrefix: 'val',
	out: 'acos',
}) {}
