import { TypedSopNode } from './_Base';
import { AnimationMixer } from 'three/src/animation/AnimationMixer';
import { CoreGroup } from '../../../core/geometry/Group';
import { Object3DWithAnimation } from '../../../core/geometry/Animation';
import { ParamType } from '../../poly/ParamType';
import { AnimationAction } from 'three/src/animation/AnimationAction';
import { BaseParamType } from '../../params/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AnimationMixerSopParamsConfig extends NodeParamsConfig {
    time: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.FLOAT>;
    prepare: import("../utils/params/ParamsConfig").ParamTemplate<ParamType.BUTTON>;
}
export declare class AnimationMixerSopNode extends TypedSopNode<AnimationMixerSopParamsConfig> {
    params_config: AnimationMixerSopParamsConfig;
    static type(): string;
    _previous_time: number | null;
    _mixer: AnimationMixer | null;
    _actions_by_name: Dictionary<AnimationAction>;
    _values_by_param_name: Dictionary<number>;
    _animation_target: Object3DWithAnimation | undefined;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private create_mixer;
    private _remove_spare_params;
    private _update_mixer;
    private _update_mixer_time;
    private _update_mixer_weights;
    static PARAM_CALLBACK_prepare(node: AnimationMixerSopNode, param: BaseParamType): void;
    prepare_animation_mixer(): Promise<void>;
}
export {};
