import { BaseParamType } from '../params/_Base';
import { DependenciesController } from './DependenciesController';
export declare class ExpressionManager {
    param: BaseParamType;
    parse_completed: boolean;
    private parse_started;
    private function_generator;
    private expression_string_generator;
    dependencies_controller: DependenciesController;
    private parsed_tree;
    constructor(param: BaseParamType);
    parse_expression(expression: string): void;
    compute_function(): Promise<any>;
    reset(): void;
    get is_errored(): boolean;
    get error_message(): string | undefined;
    private compute_allowed;
    update_from_method_dependency_name_change(): void;
}
