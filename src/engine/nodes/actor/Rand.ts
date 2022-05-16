/**
 * returns a deterministic random value
 *
 *
 *
 */
import {Vector2} from 'three';
import {CoreMath} from '../../../core/math/_Module';
import {MathFunctionArg2OperationFactory} from './_Math_Arg2Operation';

const v2 = new Vector2();

export class RandActorNode extends MathFunctionArg2OperationFactory('rand', {
	inputPrefix: 'value',
	out: 'rand',
}) {
	override paramDefaultValue(name: string) {
		return 1;
	}
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		v2.set(arg1, arg2);
		return CoreMath.randVec2(v2);
	}
}
