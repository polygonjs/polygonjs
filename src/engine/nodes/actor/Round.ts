/**
 * returns the math function round(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class RoundActorNode extends MathFunctionArg1OperationFactory('round', {
	inputPrefix: 'value',
	out: 'round',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.round(arg1);
	}
}
