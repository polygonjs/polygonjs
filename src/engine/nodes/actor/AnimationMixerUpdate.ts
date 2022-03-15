/**
 * create an animation mixer from an object that contains animation tracks
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Object3D} from 'three/src/core/Object3D';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};

class AnimationMixerUpdateActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AnimationMixerUpdateActorParamsConfig();

export class AnimationMixerUpdateActorNode extends TypedActorNode<AnimationMixerUpdateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationMixerUpdate';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.ANIMATION_MIXER,
				ActorConnectionPointType.ANIMATION_MIXER,
				CONNECTION_OPTIONS
			),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const mixer = this._inputValue<ActorConnectionPointType.ANIMATION_MIXER>(
			ActorConnectionPointType.ANIMATION_MIXER,
			context
		);
		const delta = this.scene().timeController.timeDelta();

		const root = mixer.getRoot();
		if ((root as Object3D).traverse) {
			(root as Object3D).traverse((child) => {
				if (!child.matrixAutoUpdate) {
					child.updateMatrix();
				}
			});
		}

		mixer.update(delta);
	}
}
