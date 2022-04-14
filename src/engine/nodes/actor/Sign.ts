import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SignActorNode extends MathFunctionArg1OperationFactory('sign', {
	inputPrefix: 'value',
	out: 'sign',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.sign(arg1);
	}
}
