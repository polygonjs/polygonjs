import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AnimationMixerSopParamsConfig extends NodeParamsConfig {
    time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    clip: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    reset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class AnimationMixerSopNode extends TypedSopNode<AnimationMixerSopParamsConfig> {
    params_config: AnimationMixerSopParamsConfig;
    static type(): string;
    private _previous_time;
    private _mixer;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): Promise<void>;
    private create_mixer_if_required;
    private _create_mixer;
    private _update_mixer;
    private _set_mixer_time;
    static PARAM_CALLBACK_reset(node: AnimationMixerSopNode): void;
    reset_animation_mixer(): Promise<void>;
}
export {};
