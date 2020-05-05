import { TypedSopNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { CoreGroup } from '../../../core/geometry/Group';
declare class AnimationCopySopParamsConfig extends NodeParamsConfig {
}
export declare class AnimationCopySopNode extends TypedSopNode<AnimationCopySopParamsConfig> {
    params_config: AnimationCopySopParamsConfig;
    static type(): string;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(input_contents: CoreGroup[]): void;
}
export {};
