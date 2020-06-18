import { TypedNode } from '../_Base';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { FlagsControllerB } from '../utils/FlagsController';
import { AnimationClip } from 'three/src/animation/AnimationClip';
export declare class TypedAnimNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.ANIM, K> {
    readonly flags: FlagsControllerB;
    static node_context(): NodeContext;
    static displayed_input_names(): string[];
    protected _clip: AnimationClip;
    get clip(): AnimationClip;
    initialize_base_node(): void;
    set_clip(clip: AnimationClip): void;
}
export declare type BaseAnimNodeType = TypedAnimNode<NodeParamsConfig>;
export declare class BaseAnimNodeClass extends TypedAnimNode<NodeParamsConfig> {
}
