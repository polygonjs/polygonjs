/**
 * applies the math function abs(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AbsActorNode extends MathFunctionArg1OperationFactory('abs', {
	inputPrefix: 'value',
	out: 'abs',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.abs(arg1);
	}
}
