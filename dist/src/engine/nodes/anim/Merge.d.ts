import { TypedAnimNode } from './_Base';
import { AnimationClip } from 'three/src/animation/AnimationClip';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class MergeAnimParamsConfig extends NodeParamsConfig {
}
export declare class MergeAnimNode extends TypedAnimNode<MergeAnimParamsConfig> {
    params_config: MergeAnimParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    private _merged_names;
    cook(input_clips: AnimationClip[]): void;
}
export {};
