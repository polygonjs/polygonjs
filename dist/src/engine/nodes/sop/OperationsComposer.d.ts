import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { SopOperationContainer } from '../../../core/operations/container/sop';
import { BaseOperationContainer } from '../../../core/operations/container/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class OperationsComposerSopParamConfig extends NodeParamsConfig {
}
export interface OperationContainerInputConfig {
    operation_input_index: number;
    node_input_index: number;
}
export declare class OperationsComposerSopNode extends TypedSopNode<OperationsComposerSopParamConfig> {
    params_config: OperationsComposerSopParamConfig;
    static type(): string;
    initialize_node(): void;
    private _output_operation_container;
    private _input_configs_by_operation_container;
    set_output_operation_container(operation_container: SopOperationContainer): void;
    output_operation_container(): SopOperationContainer | undefined;
    add_input_config(operation: SopOperationContainer, input_config: OperationContainerInputConfig): void;
    private _operation_containers_requiring_resolve;
    add_operation_container_with_path_param_resolve_required(operation_container: BaseOperationContainer): void;
    resolve_operation_containers_path_params(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
}
export {};
