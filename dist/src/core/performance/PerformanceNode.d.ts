import { BaseNodeType } from '../../engine/nodes/_Base';
export interface PerformancePrintObject {
    full_path: string;
    cooks_count: number;
    cook_time_total: number;
    cook_time_per_iteration: number;
    cook_time_total_with_inputs: number;
    cook_time_total_with_inputs_per_iteration: number;
    cook_time_total_params: number;
    cook_time_total_params_per_iteration: number;
}
export declare class PerformanceNode {
    private _node;
    _cooks_count: number;
    _cook_time_total: number;
    _cook_time_total_with_inputs: number;
    _cook_time_total_params: number;
    constructor(_node: BaseNodeType);
    update_cook_data(): void;
    get cook_time_total(): number;
    get cook_time_per_iteration(): number;
    get cook_time_total_with_inputs(): number;
    get cook_time_total_with_inputs_per_iteration(): number;
    get cook_time_total_params(): number;
    get cook_time_total_params_per_iteration(): number;
    get cooks_count(): number;
    print_object(): PerformancePrintObject;
}
