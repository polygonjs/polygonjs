/**
 * adds 2 inputs together
 *
 *
 */
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class AddActorNode extends MathFunctionArgNOperationFactory('add', {
	inputPrefix: 'add',
	out: 'sum',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 + arg2;
	}
}
