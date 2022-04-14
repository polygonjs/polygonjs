import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class SinActorNode extends MathFunctionArg1OperationFactory('sin', {
	inputPrefix: 'angle',
	out: 'sin',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.sin(arg1);
	}
}
