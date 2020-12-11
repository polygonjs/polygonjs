import { TypedAnimNode } from './_Base';
import { TimelineBuilder } from '../../../core/animation/TimelineBuilder';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NullAnimParamsConfig extends NodeParamsConfig {
    play: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
    pause: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class NullAnimNode extends TypedAnimNode<NullAnimParamsConfig> {
    params_config: NullAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_contents: TimelineBuilder[]): void;
    private _timeline_builder;
    private _timeline;
    play(): Promise<unknown>;
    pause(): Promise<void>;
    static PARAM_CALLBACK_play(node: NullAnimNode): void;
    static PARAM_CALLBACK_pause(node: NullAnimNode): void;
}
export {};
