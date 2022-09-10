/**
 * divides the 1st input by the 2nd one
 *
 *
 */
import {MathFunctionArg2OperationFactory} from './_Math_Arg2Operation';

export class DivideActorNode extends MathFunctionArg2OperationFactory('divide', {
	inputPrefix: 'div',
	out: 'divide',
}) {
	override paramDefaultValue(name: string) {
		return 1;
	}
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 / arg2;
	}
}
