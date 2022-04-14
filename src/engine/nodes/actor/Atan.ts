import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AtanActorNode extends MathFunctionArg1OperationFactory('atan', {
	inputPrefix: 'value',
	out: 'angle',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.atan(arg1);
	}
}
