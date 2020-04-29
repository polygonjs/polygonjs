import { TypedJsDefinition, JsDefinitionType } from './JsDefinition';
export declare class TypedJsDefinitionCollection<T extends JsDefinitionType> {
    private _definitions;
    _errored: boolean;
    _error_message: string | undefined;
    constructor(_definitions?: TypedJsDefinition<T>[]);
    get errored(): boolean;
    get error_message(): string | undefined;
    uniq(): TypedJsDefinition<T>[];
}
