/**
 * pauses an AnimationAction
 *
 *
 */

import {AnimationAction} from 'three/src/animation/AnimationAction';
import {ParamlessAnimationActionActorNode} from './_BaseAnimationAction';

export class AnimationActionStopActorNode extends ParamlessAnimationActionActorNode {
	static override type() {
		return 'animationActionStop';
	}
	protected _receiveTriggerForAnimationAction(animationAction: AnimationAction): void {
		animationAction.stop();
	}
}
