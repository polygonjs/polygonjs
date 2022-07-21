/**
 * applies the math function ceil(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class CeilActorNode extends MathFunctionArg1OperationFactory('ceil', {
	inputPrefix: 'value',
	out: 'ceil',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.ceil(arg1);
	}
}
