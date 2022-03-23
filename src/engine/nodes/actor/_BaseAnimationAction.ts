import {TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AnimationAction} from 'three/src/animation/AnimationAction';
import {BaseNodeType} from '../_Base';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {EventListener, Event} from 'three/src/core/EventDispatcher';

export type AnimationActionLoopEvent = Event & {
	type: 'loop';
} & {
	target: AnimationMixer;
} & {
	action: AnimationAction;
};

export type AnimationActionEventListenerExtended = EventListener<Event, 'loop', AnimationMixer> &
	((e: AnimationActionLoopEvent) => void);

export const ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK = {
	callback: (node: BaseNodeType) => {
		AnimationActionBaseActorNode.PARAM_CALLBACK_sendTrigger(node as AnimationActionBaseActorNode<any>);
	},
};

/*
 *
 * COMMON
 *
 */
export abstract class AnimationActionBaseActorNode<K extends NodeParamsConfig> extends TypedActorNode<K> {
	protected _setAnimationActionWeight(action: AnimationAction, weight: number) {
		action.enabled = true;
		action.setEffectiveTimeScale(1);
		action.setEffectiveWeight(weight);
	}
	protected _crossFade(from: AnimationAction, to: AnimationAction, duration: number, warp: boolean) {
		this._setAnimationActionWeight(to, 1);
		// animationActionTo.time = 0;
		to.syncWith(from);
		to.play();
		from.crossFadeTo(to, duration, warp);
	}
	static PARAM_CALLBACK_sendTrigger(node: AnimationActionBaseActorNode<any>) {
		node._triggerWithNode();
	}

	private _triggerWithNode() {
		this.scene().actorsManager.manualActorTriggers.setNodeToReceiveTrigger(this);
	}
}
