/**
 * applies the math function floor(x)
 *
 *
 */
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

export class FloorActorNode extends MathFunctionArg1OperationFactory('floor', {
	inputPrefix: 'value',
	out: 'floor',
}) {
	protected _applyOperation<T extends number>(arg1: T): any {
		return Math.floor(arg1);
	}
}
