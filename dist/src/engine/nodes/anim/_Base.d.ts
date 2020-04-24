import { TypedNode } from '../_Base';
import { TypedContainerController } from '../utils/ContainerController';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { FlagsControllerB } from '../utils/FlagsController';
import { AnimationContainer } from '../../containers/Animation';
import { AnimationClip } from 'three/src/animation/AnimationClip';
export declare class TypedAnimNode<K extends NodeParamsConfig> extends TypedNode<'ANIMATION', BaseAnimNodeType, K> {
    container_controller: TypedContainerController<AnimationContainer>;
    readonly flags: FlagsControllerB;
    static node_context(): NodeContext;
    static displayed_input_names(): string[];
    initialize_base_node(): void;
    set_clip(clip: AnimationClip): void;
}
export declare type BaseAnimNodeType = TypedAnimNode<NodeParamsConfig>;
export declare class BaseAnimNodeClass extends TypedAnimNode<NodeParamsConfig> {
}
