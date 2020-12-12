import { ParamsInitData } from '../../../engine/nodes/utils/io/IOController';
import { BaseNodeType } from '../../../engine/nodes/_Base';
import { BaseOperation, DefaultOperationParams } from '../_Base';
import { InputsController } from './utils/InputsController';
export declare class BaseOperationContainer {
    protected operation: BaseOperation;
    protected name: string;
    protected params: DefaultOperationParams;
    private _path_params;
    constructor(operation: BaseOperation, name: string, init_params: ParamsInitData);
    path_param_resolve_required(): boolean;
    resolve_path_params(node_start: BaseNodeType): void;
    private _apply_default_params;
    private _apply_init_params;
    private _convert_param_data;
    private _convert_export_param_data;
    protected _inputs: BaseOperationContainer[] | undefined;
    set_input(index: number, input: BaseOperationContainer): void;
    inputs_count(): number;
    private _inputs_controller;
    protected inputs_controller(): InputsController;
    private _init_cloned_states;
    input_clone_required(index: number): boolean;
    override_input_clone_state(state: boolean): void;
    cook(input_contents: any[]): any;
}
