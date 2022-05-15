import {MathFunctionArg2OperationFactory} from './_Math_Arg2Operation';

export class PowActorNode extends MathFunctionArg2OperationFactory('pow', {
	inputPrefix: 'value',
	out: 'pow',
}) {
	override paramDefaultValue(name: string) {
		return 1;
	}
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 ** arg2;
	}
}
