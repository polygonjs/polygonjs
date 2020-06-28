import { BaseMethod } from '../../../expressions/methods/_Base';
export declare class BaseExpressionRegister {
    private _methods_by_name;
    register_expression(expression: typeof BaseMethod, name: string): void;
    get_method(name: string): typeof BaseMethod | undefined;
}
