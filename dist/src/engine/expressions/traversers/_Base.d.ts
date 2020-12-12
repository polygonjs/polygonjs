import { BaseParamType } from '../../params/_Base';
import jsep from 'jsep';
export declare const VARIABLE_PREFIX = "$";
export declare abstract class BaseTraverser {
    param: BaseParamType;
    _error_message: string | undefined;
    constructor(param: BaseParamType);
    protected clear_error(): void;
    protected set_error(message: string): void;
    protected _set_error_from_error_bound: (error: Error | string) => void;
    private _set_error_from_error;
    get is_errored(): boolean;
    get error_message(): string | undefined;
    reset(): void;
    traverse_node(node: jsep.Expression): string | undefined;
    protected abstract traverse_CallExpression(node: jsep.CallExpression): string | undefined;
    protected traverse_BinaryExpression(node: jsep.BinaryExpression): string;
    protected traverse_LogicalExpression(node: jsep.LogicalExpression): string;
    protected traverse_MemberExpression(node: jsep.MemberExpression): string;
    protected traverse_ConditionalExpression(node: jsep.ConditionalExpression): string;
    protected traverse_Compound(node: jsep.Compound): string;
    protected abstract traverse_UnaryExpression(node: jsep.UnaryExpression): string;
    protected traverse_Literal(node: jsep.Literal): string;
    protected abstract traverse_Identifier(node: jsep.Identifier): string | undefined;
}
