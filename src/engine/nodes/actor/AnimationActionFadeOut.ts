/**
 * fades out an AnimationAction
 *
 *
 */

import {AnimationActionBaseActorNode, ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK} from './_BaseAnimationAction';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
export class AnimationActionFadeOutActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK);
	/** @param fadeIn duration */
	duration = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AnimationActionFadeOutActorParamsConfig();

export class AnimationActionFadeOutActorNode extends AnimationActionBaseActorNode<AnimationActionFadeOutActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionFadeOut';
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
		const animationAction = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
			ActorConnectionPointType.ANIMATION_ACTION,
			context
		);
		if (!animationAction) {
			return;
		}
		const duration = this._inputValueFromParam<ParamType.FLOAT>(this.p.duration, context);
		animationAction.fadeOut(duration);
	}
}
