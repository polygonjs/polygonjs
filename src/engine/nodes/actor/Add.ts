import {MathFunctionArg2OperationFactory} from './_Math_Arg2Operation';

export class AddActorNode extends MathFunctionArg2OperationFactory('add', {
	inputPrefix: 'add',
	out: 'sum',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 + arg2;
	}
}
