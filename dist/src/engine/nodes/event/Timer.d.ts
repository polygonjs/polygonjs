import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TimerEventParamsConfig extends NodeParamsConfig {
    period: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
}
export declare class TimerEventNode extends TypedEventNode<TimerEventParamsConfig> {
    params_config: TimerEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    private _timer_active;
    private _start_timer;
    protected _stop_timer(): void;
    private _run_timer;
}
export {};
