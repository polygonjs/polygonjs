/**
 * pauses an AnimationAction
 *
 *
 */

import {AnimationAction} from 'three/src/animation/AnimationAction';
import {ParamlessAnimationActionActorNode} from './_BaseAnimationAction';

export class AnimationActionPlayActorNode extends ParamlessAnimationActionActorNode {
	static override type() {
		return 'animationActionPlay';
	}
	protected _receiveTriggerForAnimationAction(animationAction: AnimationAction): void {
		animationAction.play();
	}
}
