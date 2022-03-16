/**
 * fades out an AnimationAction
 *
 *
 */

import {AnimationActionFadeActorNode} from './_BaseAnimationAction';
import {AnimationAction} from 'three/src/animation/AnimationAction';

export class AnimationActionFadeOutActorNode extends AnimationActionFadeActorNode {
	static override type() {
		return 'animationActionFadeOut';
	}
	protected _applyFade(action: AnimationAction, duration: number) {
		action.fadeOut(duration);
	}
}
