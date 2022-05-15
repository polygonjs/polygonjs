import {Vector2, Vector3, Vector4} from 'three';
import {MathFunctionArg1OperationFactory} from './_Math_Arg1Operation';

const tmp2 = new Vector2();
const tmp3 = new Vector3();
const tmp4 = new Vector4();

export class ComplementActorNode extends MathFunctionArg1OperationFactory('complement', {
	inputPrefix: 'value',
	out: 'complement',
}) {
	protected _applyOperation<T extends number | Vector2 | Vector3 | Vector4>(arg1: T): T {
		if (arg1 instanceof Vector2) {
			return tmp2.copy(arg1).multiplyScalar(-1).addScalar(1) as T;
		}
		if (arg1 instanceof Vector3) {
			return tmp3.copy(arg1).multiplyScalar(-1).addScalar(1) as T;
		}
		if (arg1 instanceof Vector4) {
			return tmp4.copy(arg1).multiplyScalar(-1).addScalar(1) as T;
		}
		return (1 - (arg1 as number)) as T;
	}
}
