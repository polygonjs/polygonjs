/**
 * create an animation action from an animation mixer
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Object3D} from 'three/src/core/Object3D';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};

class AnimationActionActorParamsConfig extends NodeParamsConfig {
	actionName = ParamConfig.STRING('');
}
const ParamsConfig = new AnimationActionActorParamsConfig();

export class AnimationActionActorNode extends TypedActorNode<AnimationActionActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationAction';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.ANIMATION_MIXER,
				ActorConnectionPointType.ANIMATION_MIXER,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('animationAction', ActorConnectionPointType.ANIMATION_ACTION),
		]);
	}

	public override outputValue(inputName: string, context: ActorNodeTriggerContext) {
		const mixer = this._inputValue<ActorConnectionPointType.ANIMATION_MIXER>(
			ActorConnectionPointType.ANIMATION_MIXER,
			context
		);
		const root = mixer.getRoot();
		const animations = (root as Object3D).animations;
		if (!animations) {
			return -1;
		}
		const animation = animations.find((animation) => animation.name == this.pv.actionName);
		if (!animation) {
			return -1;
		}
		const action = mixer.clipAction(animation);
		console.log('create action', action);
		action.play();
		return action;
	}
}
