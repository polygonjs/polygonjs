/**
 * create an animation mixer from an object that contains animation tracks
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {Object3D} from 'three/src/core/Object3D';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};

class AnimationMixerActorParamsConfig extends NodeParamsConfig {
	time = ParamConfig.FLOAT(0);
	timeScale = ParamConfig.FLOAT(1);
}
const ParamsConfig = new AnimationMixerActorParamsConfig();

export class AnimationMixerActorNode extends TypedActorNode<AnimationMixerActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationMixer';
	}

	override dispose(): void {
		super.dispose();
		this._mixerByObject.clear();
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			// new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.ANIMATION_MIXER,
				ActorConnectionPointType.ANIMATION_MIXER
			),
		]);
	}

	private _mixerByObject: Map<Object3D, AnimationMixer> = new Map();
	public override outputValue(inputName: string, context: ActorNodeTriggerContext) {
		const {Object3D} = context;
		let mixer = this._mixerByObject.get(Object3D);
		if (!mixer) {
			mixer = new AnimationMixer(Object3D);
			(window as any).mixer = mixer;
			console.log('create mixer', mixer, Object3D);
			this._mixerByObject.set(Object3D, mixer);

			// Object3D.traverse((child) => (child.matrixAutoUpdate = true));

			const root = mixer.getRoot();
			const animations = (root as Object3D).animations;
			if (!animations) {
				return -1;
			}
			for (let animation of animations) {
				const action = mixer.clipAction(animation);
				// action.enabled = true;
				// action.setEffectiveTimeScale(1);
				// action.setEffectiveWeight(1);
				// console.log('create action', action);
				action.play();
			}
		}
		return mixer;
	}
}
