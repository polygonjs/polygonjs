import {AnimationClip} from 'three';
import {Object3DWithGeometry} from './Group';
export interface Object3DWithAnimation extends Object3DWithGeometry {
	animations: AnimationClip[];
}
