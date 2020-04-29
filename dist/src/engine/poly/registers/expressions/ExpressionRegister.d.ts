import { BaseExpressionRegister } from './_BaseRegister';
import { ExpressionMap } from './All';
export declare class ExpressionRegister extends BaseExpressionRegister {
    get_method<K extends keyof ExpressionMap>(name: K): ExpressionMap[K] | undefined;
}
