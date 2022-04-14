import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SqrtActorNode extends MathFunctionArg1OperationFactory('sqrt', {
	inputPrefix: 'value',
	out: 'sqrt',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.sqrt(arg1);
	}
}
