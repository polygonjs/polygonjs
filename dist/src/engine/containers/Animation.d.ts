import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { AnimationClip } from 'three/src/animation/AnimationClip';
export declare class AnimationContainer extends TypedContainer<ContainableMap['ANIMATION']> {
    set_content(content: ContainableMap['ANIMATION']): void;
    set_animation_clip(clip: AnimationClip): void;
    animation_clip(): AnimationClip;
}
