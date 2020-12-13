import { BaseMethod } from '../../../expressions/methods/_Base';
export declare class BaseExpressionRegister {
    private _methods_by_name;
    register(expression: typeof BaseMethod, name: string): void;
    getMethod(name: string): typeof BaseMethod | undefined;
}
