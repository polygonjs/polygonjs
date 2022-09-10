/**
 * applies the math function acos(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class AcosActorNode extends MathFunctionArg1OperationFactory('acos', {
	inputPrefix: 'cos',
	out: 'angle',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.acos(arg1);
	}
}
