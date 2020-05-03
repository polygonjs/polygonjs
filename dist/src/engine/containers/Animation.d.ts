import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { AnimationClip } from 'three/src/animation/AnimationClip';
import { NodeContext } from '../poly/NodeContext';
export declare class AnimationContainer extends TypedContainer<NodeContext.ANIM> {
    set_content(content: ContainableMap[NodeContext.ANIM]): void;
    set_animation_clip(clip: AnimationClip): void;
    animation_clip(): AnimationClip;
}
