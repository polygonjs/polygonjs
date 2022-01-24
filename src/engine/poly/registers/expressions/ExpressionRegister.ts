import {BaseExpressionRegister} from './_BaseRegister';
import {ExpressionMap} from './All';

export class ExpressionRegister extends BaseExpressionRegister {
	override getMethod<K extends keyof ExpressionMap>(name: K): ExpressionMap[K] | undefined {
		return super.getMethod(name as any);
	}
}
