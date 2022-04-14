import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class TanActorNode extends MathFunctionArg1OperationFactory('tan', {
	inputPrefix: 'angle',
	out: 'tan',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.tan(arg1);
	}
}
