import { TypedAnimNode } from './_Base';
import { AnimationClip } from 'three/src/animation/AnimationClip';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class DeleteAnimParamsConfig extends NodeParamsConfig {
    pattern: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    invert: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class DeleteAnimNode extends TypedAnimNode<DeleteAnimParamsConfig> {
    params_config: DeleteAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_clips: AnimationClip[]): void;
}
export {};
