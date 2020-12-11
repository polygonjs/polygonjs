import {BaseExpressionRegister} from './_BaseRegister';
import {ExpressionMap} from './All';

export class ExpressionRegister extends BaseExpressionRegister {
	get_method<K extends keyof ExpressionMap>(name: K): ExpressionMap[K] | undefined {
		return super.getMethod(name as any);
	}
}
