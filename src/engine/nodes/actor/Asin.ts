import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AsinActorNode extends MathFunctionArg1OperationFactory('asin', {
	inputPrefix: 'sin',
	out: 'angle',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.asin(arg1);
	}
}
