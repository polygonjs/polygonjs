import { BaseNodeType } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
export declare class NodeCookController<NC extends NodeContext> {
    private node;
    private _core_performance;
    private _cooking;
    private _cooking_dirty_timestamp;
    private _performance_controller;
    constructor(node: BaseNodeType);
    get performance_record_started(): boolean;
    private _inputs_evaluation_required;
    disallow_inputs_evaluation(): void;
    get is_cooking(): boolean;
    private _init_cooking_state;
    private _start_cook_if_no_errors;
    cook_main(): Promise<void>;
    cook_main_without_inputs(): Promise<void>;
    end_cook(message?: string | null): void;
    private _terminate_cook_process;
    private _evaluate_inputs;
    private _evaluate_params;
    get cooks_count(): number;
    get cook_time(): number;
    private _finalize_cook_performance;
}
