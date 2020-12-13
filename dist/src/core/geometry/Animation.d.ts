import { AnimationClip } from 'three/src/animation/AnimationClip';
import { Object3DWithGeometry } from './Group';
export interface Object3DWithAnimation extends Object3DWithGeometry {
    animations: AnimationClip[];
}
