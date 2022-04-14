import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class CosActorNode extends MathFunctionArg1OperationFactory('cos', {
	inputPrefix: 'angle',
	out: 'cos',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.cos(arg1);
	}
}
