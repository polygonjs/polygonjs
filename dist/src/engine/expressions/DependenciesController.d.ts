import { BaseParamType } from '../params/_Base';
import { FunctionGenerator } from './traversers/FunctionGenerator';
import jsep from 'jsep';
export interface JsepsByString {
    [propName: string]: jsep.Expression[];
}
export declare class DependenciesController {
    param: BaseParamType;
    error_message: string | undefined;
    private cyclic_graph_detected;
    private method_dependencies;
    constructor(param: BaseParamType);
    protected set_error(message: string): void;
    reset(): void;
    update(function_generator: FunctionGenerator): void;
    private connect_immutable_dependencies;
    private handle_method_dependencies;
    private handle_method_dependency;
    private listen_for_name_changes;
}
