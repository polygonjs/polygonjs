/**
 * returns the min value of 2 inputs
 *
 *
 */
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class MinActorNode extends MathFunctionArgNOperationFactory('min', {
	inputPrefix: 'min',
	out: 'min',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return Math.min(arg1, arg2);
	}
}
