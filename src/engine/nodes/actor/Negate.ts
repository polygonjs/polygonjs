/**
 * return x*-1.
 *
 * @remarks
 *
 * So if the input positive, it returns its negative value, or vice versa.
 * If it 7, this returns -7.
 * Or if it is -5, it returns 5.
 *
 *
 */
import {Vector2, Vector3, Vector4} from 'three';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const tmp2 = new Vector2();
const tmp3 = new Vector3();
const tmp4 = new Vector4();

export class NegateActorNode extends MathFunctionArg1OperationFactory('negate', {
	inputPrefix: 'value',
	out: 'negate',
}) {
	protected _applyOperation<T extends number | Vector2 | Vector3 | Vector4>(arg1: T): T {
		if (arg1 instanceof Vector2) {
			return tmp2.copy(arg1).multiplyScalar(-1) as T;
		}
		if (arg1 instanceof Vector3) {
			return tmp3.copy(arg1).multiplyScalar(-1) as T;
		}
		if (arg1 instanceof Vector4) {
			return tmp4.copy(arg1).multiplyScalar(-1) as T;
		}
		return -(arg1 as number) as T;
	}
}
