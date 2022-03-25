/**
 * fades in an AnimationAction
 *
 *
 */

import {
	AnimationActionBaseActorNode,
	AnimationActionEventListenerExtended,
	AnimationActionLoopEvent,
} from './_BaseAnimationAction';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, ACTOR_NODE_SELF_TRIGGER_CALLBACK} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {EventListener, Event} from 'three/src/core/EventDispatcher';
import {AnimationAction} from 'three/src/animation/AnimationAction';
import {getMostActiveAnimationActionFromMixer} from '../../../core/actor/AnimationMixerUtils';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class AnimationActionFadeInActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ACTOR_NODE_SELF_TRIGGER_CALLBACK);
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
	/** @param fade out other actions */
	fadeOutOtherActions = ParamConfig.BOOLEAN(1);
	/** @param additional warping (gradually changes of the time scales) will be applied */
	warp = ParamConfig.BOOLEAN(1, {
		visibleIf: {fadeOutOtherActions: 1},
	});
	/** @param starts cross fade when the from action ends */
	startOnFromActionEnd = ParamConfig.BOOLEAN(1, {
		visibleIf: {fadeOutOtherActions: 1},
	});
}
const ParamsConfig = new AnimationActionFadeInActorParamsConfig();

export class AnimationActionFadeInActorNode extends AnimationActionBaseActorNode<AnimationActionFadeInActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionFadeIn';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.ANIMATION_ACTION,
				ActorConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const duration = this._inputValueFromParam<ParamType.FLOAT>(this.p.duration, context);
		const fadeOutOtherActions = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.fadeOutOtherActions, context);

		const animationActionTo = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
			ActorConnectionPointType.ANIMATION_ACTION,
			context
		);
		if (!animationActionTo) {
			return;
		}
		if (fadeOutOtherActions) {
			this._fadeOutOtherActions(context, animationActionTo, duration);
		} else {
			this._fadeInSimple(animationActionTo, duration);
		}
	}

	private _fadeOutOtherActions(
		context: ActorNodeTriggerContext,
		animationActionTo: AnimationAction,
		duration: number
	) {
		const warp = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.startOnFromActionEnd, context);
		const startOnFromActionEnd = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.startOnFromActionEnd, context);
		const mixer = animationActionTo.getMixer();
		const {otherActions, mostActiveAnimationAction} = getMostActiveAnimationActionFromMixer(
			mixer,
			animationActionTo
		);
		const animationActionFrom = mostActiveAnimationAction;
		const _fadeInCurrentAndFadeOutOtherActions = () => {
			this._crossFade(animationActionFrom, animationActionTo, duration, warp);

			for (let action of otherActions) {
				action.fadeOut(duration);
			}
		};

		if (otherActions.length == 0) {
			this._fadeInSimple(animationActionTo, duration);
		} else {
			if (startOnFromActionEnd) {
				animationActionTo.stop();
				this._fadeInWhenPreviousLoopCompleted(mixer, animationActionFrom, _fadeInCurrentAndFadeOutOtherActions);
			} else {
				_fadeInCurrentAndFadeOutOtherActions();
			}
		}
	}

	private _fadeInWhenPreviousLoopCompleted(
		mixer: AnimationMixer,
		animationActionFrom: AnimationAction,
		callback: () => void
	) {
		const onLoop: AnimationActionEventListenerExtended = ((event: AnimationActionLoopEvent) => {
			if (event.action === animationActionFrom) {
				mixer.removeEventListener('loop', onLoop);

				callback();
			}
		}) as EventListener<Event, 'loop', AnimationMixer>;
		mixer.addEventListener('loop', onLoop);
	}

	private _fadeInSimple(animationActionTo: AnimationAction, duration: number) {
		this._setAnimationActionWeight(animationActionTo, 1);
		animationActionTo.fadeIn(duration);
	}
}
