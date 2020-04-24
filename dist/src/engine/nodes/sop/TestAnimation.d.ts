import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { BaseParamType } from '../../params/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class TestAnimationSopParamsConfig extends NodeParamsConfig {
    time: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    reset: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BUTTON>;
}
export declare class TestAnimationSopNode extends TypedSopNode<TestAnimationSopParamsConfig> {
    params_config: TestAnimationSopParamsConfig;
    static type(): string;
    private _mixer;
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
    private _create_mixer_if_required;
    private _create_mixer;
    private _create_clip;
    static PARAM_CALLBACK_reset(node: TestAnimationSopNode, param: BaseParamType): void;
    private reset_mixer;
}
export {};
