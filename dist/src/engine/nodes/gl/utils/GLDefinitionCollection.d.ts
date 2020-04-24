import { TypedGLDefinition, GLDefinitionType } from './GLDefinition';
export declare class TypedGLDefinitionCollection<T extends GLDefinitionType> {
    private _definitions;
    _errored: boolean;
    _error_message: string | undefined;
    constructor(_definitions?: TypedGLDefinition<T>[]);
    get errored(): boolean;
    get error_message(): string | undefined;
    uniq(): TypedGLDefinition<T>[];
}
