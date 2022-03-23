/**
 * create an animation action from an animation mixer
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {Object3D} from 'three/src/core/Object3D';
import {AnimationAction} from 'three/src/animation/AnimationAction';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {isBooleanTrue} from '../../../core/Type';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class AnimationActionActorParamsConfig extends NodeParamsConfig {
	clipName = ParamConfig.STRING('');
	autoPlay = ParamConfig.BOOLEAN(1);
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

	private _actionByNameByMixer: Map<AnimationMixer, Map<string, AnimationAction>> = new Map();
	public override outputValue(context: ActorNodeTriggerContext) {
		const mixer = this._inputValue<ActorConnectionPointType.ANIMATION_MIXER>(
			ActorConnectionPointType.ANIMATION_MIXER,
			context
		);
		if (!mixer) {
			return;
		}
		let map = this._actionByNameByMixer.get(mixer);
		if (!map) {
			map = new Map();
			this._actionByNameByMixer.set(mixer, map);
		}
		const clipName = this.pv.clipName;
		let action = map.get(clipName);
		if (!action) {
			const root = mixer.getRoot();
			const animations = (root as Object3D).animations;
			if (!animations) {
				return;
			}
			const animation = animations.find((animation) => animation.name == clipName);
			if (!animation) {
				return;
			}
			action = mixer.existingAction(animation) || mixer.clipAction(animation);
			if (isBooleanTrue(this.pv.autoPlay)) {
				action.play();
			}

			map.set(clipName, action);
		}

		return action;
	}
}
