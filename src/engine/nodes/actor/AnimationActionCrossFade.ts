/**
 * cross fades 2 AnimationActions
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';
import {
	AnimationActionBaseActorNode,
	AnimationActionEventListenerExtended,
	AnimationActionLoopEvent,
	ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK,
} from './_BaseAnimationAction';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {EventListener, Event} from 'three/src/core/EventDispatcher';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
enum AnimationActionCrossFadeActorNodeInputName {
	FROM = 'from',
	to = 'to',
}

class AnimationActionCrossFadeActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK);
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
	/** @param additional warping (gradually changes of the time scales) will be applied */
	warp = ParamConfig.BOOLEAN(1);
	/** @param starts cross fade when the from action ends */
	startOnFromActionEnd = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new AnimationActionCrossFadeActorParamsConfig();

export class AnimationActionCrossFadeActorNode extends AnimationActionBaseActorNode<AnimationActionCrossFadeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionCrossFade';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				AnimationActionCrossFadeActorNodeInputName.FROM,
				ActorConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				AnimationActionCrossFadeActorNodeInputName.to,
				ActorConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const animationActionFrom = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
			AnimationActionCrossFadeActorNodeInputName.FROM,
			context
		);
		const duration = this._inputValueFromParam<ParamType.FLOAT>(this.p.duration, context);
		const startOnFromActionEnd: boolean = this._inputValueFromParam<ParamType.BOOLEAN>(
			this.p.startOnFromActionEnd,
			context
		);
		const warp = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.warp, context);

		const startCrossFade = () => {
			// only request animationActionTo at the last moment,
			// in case it is set to autoPlay,
			// as it would otherwise start playing before as soon as it is created,
			// which could be way before this function is called
			const animationActionTo = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
				AnimationActionCrossFadeActorNodeInputName.to,
				context
			);
			this._crossFade(animationActionFrom, animationActionTo, duration, warp);
		};

		if (startOnFromActionEnd) {
			const mixer = animationActionFrom.getMixer();
			const onLoop: AnimationActionEventListenerExtended = ((event: AnimationActionLoopEvent) => {
				if (event.action === animationActionFrom) {
					mixer.removeEventListener('loop', onLoop);

					startCrossFade();
				}
			}) as EventListener<Event, 'loop', AnimationMixer>;
			mixer.addEventListener('loop', onLoop);
		} else {
			startCrossFade();
		}
	}
}
