/**
 * subtracts the 2nd input from the 1st
 *
 *
 */
import {MathFunctionArg2OperationFactory} from './_Math_Arg2Operation';

export class SubtractActorNode extends MathFunctionArg2OperationFactory('subtract', {
	inputPrefix: 'sub',
	out: 'subtract',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 - arg2;
	}
}
