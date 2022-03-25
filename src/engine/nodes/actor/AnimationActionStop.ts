/**
 * pauses an AnimationAction
 *
 *
 */

import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, ACTOR_NODE_SELF_TRIGGER_CALLBACK, TRIGGER_CONNECTION_NAME} from './_Base';
import {AnimationActionBaseActorNode} from './_BaseAnimationAction';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class AnimationActionStopActorParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	trigger = ParamConfig.BUTTON(null, ACTOR_NODE_SELF_TRIGGER_CALLBACK);
}
const ParamsConfig = new AnimationActionStopActorParamsConfig();

export class AnimationActionStopActorNode extends AnimationActionBaseActorNode<AnimationActionStopActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionStop';
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
		animationAction.stop();
	}
}
