import { TypedAnimNode } from './_Base';
import { AnimationClip } from 'three/src/animation/AnimationClip';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class NullAnimParamsConfig extends NodeParamsConfig {
}
export declare class NullAnimNode extends TypedAnimNode<NullAnimParamsConfig> {
    params_config: NullAnimParamsConfig;
    static type(): string;
    initialize_node(): void;
    cook(input_clips: AnimationClip[]): void;
}
export {};
