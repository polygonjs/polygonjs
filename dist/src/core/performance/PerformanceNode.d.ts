import { BaseNodeType } from '../../engine/nodes/_Base';
export interface PerformancePrintObject {
    full_path: string;
    cooks_count: number;
    total_time: number;
    total_cook_time: number;
    cook_time_per_iteration: number;
    inputs_time_per_iteration: number;
    params_time_per_iteration: number;
}
import { NodePerformanceData } from '../../engine/nodes/utils/cook/PerformanceController';
export declare class PerformanceNode {
    private _node;
    _cooks_count: number;
    _total_cook_time: number;
    _total_inputs_time: number;
    _total_params_time: number;
    constructor(_node: BaseNodeType);
    update_cook_data(performance_data: NodePerformanceData): void;
    get total_time(): number;
    get total_cook_time(): number;
    get cook_time_per_iteration(): number;
    get total_inputs_time(): number;
    get inputs_time_per_iteration(): number;
    get total_params_time(): number;
    get params_time_per_iteration(): number;
    get cooks_count(): number;
    print_object(): PerformancePrintObject;
}
