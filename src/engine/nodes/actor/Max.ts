import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class MaxActorNode extends MathFunctionArgNOperationFactory('max', {
	inputPrefix: 'max',
	out: 'max',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return Math.max(arg1, arg2);
	}
}
