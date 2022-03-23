/**
 * plays an AnimationAction
 *
 *
 */

import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {AnimationActionBaseActorNode, ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK} from './_BaseAnimationAction';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class AnimationActionPlayActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ANIMATION_ACTION_ACTOR_NODE_TRIGGER_CALLBACK);
}
const ParamsConfig = new AnimationActionPlayActorParamsConfig();

export class AnimationActionPlayActorNode extends AnimationActionBaseActorNode<AnimationActionPlayActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionPlay';
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
		animationAction.play();
	}
}
