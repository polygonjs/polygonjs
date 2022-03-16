import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {AnimationAction} from 'three/src/animation/AnimationAction';
import {BaseNodeType} from '../_Base';
import {ParamType} from '../../poly/ParamType';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {EventListener, Event} from 'three/src/core/EventDispatcher';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

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

/*
 *
 * PARAMLESS
 *
 */
class AnimationActionActorEmptyParamsConfig extends NodeParamsConfig {}
const EmptyParamsConfig = new AnimationActionActorEmptyParamsConfig();

export abstract class ParamlessAnimationActionActorNode extends AnimationActionBaseActorNode<AnimationActionActorEmptyParamsConfig> {
	override readonly paramsConfig = EmptyParamsConfig;

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
		const animationAction = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
			ActorConnectionPointType.ANIMATION_ACTION,
			context
		);
		this._receiveTriggerForAnimationAction(animationAction);
	}
	protected abstract _receiveTriggerForAnimationAction(animationAction: AnimationAction): void;
}

/*
 *
 * FADE
 *
 */

export class AnimationActionFadeActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK);
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AnimationActionFadeActorParamsConfig();

export abstract class AnimationActionFadeActorNode extends AnimationActionBaseActorNode<AnimationActionFadeActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

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
		const animationAction = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
			ActorConnectionPointType.ANIMATION_ACTION,
			context
		);
		const duration = this._inputValueFromParam<ParamType.FLOAT>(this.p.duration, context);
		this._applyFade(animationAction, duration);
	}
	protected abstract _applyFade(action: AnimationAction, duration: number): void;
}
