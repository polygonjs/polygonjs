import { NodeCookController } from '../CookController';
export interface NodePerformanceData {
    inputs_time: number;
    params_time: number;
    cook_time: number;
}
export declare class NodeCookPerformanceformanceController {
    private cook_controller;
    private _inputs_start;
    private _params_start;
    private _cook_start;
    private _cooks_count;
    private _data;
    constructor(cook_controller: NodeCookController<any>);
    get cooks_count(): number;
    get data(): NodePerformanceData;
    get active(): boolean;
    record_inputs_start(): void;
    record_inputs_end(): void;
    record_params_start(): void;
    record_params_end(): void;
    record_cook_start(): void;
    record_cook_end(): void;
}
