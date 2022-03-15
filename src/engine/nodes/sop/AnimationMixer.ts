// import {TypedSopNode} from './_Base';
// import {AnimationMixer} from 'three/src/animation/AnimationMixer';
// import {InputCloneMode} from '../../poly/InputCloneMode';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {BaseNodeType} from '../_Base';
// import {Object3D} from 'three/src/core/Object3D';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {BaseParamType} from '../../params/_Base';
// class AnimationMixerSopParamsConfig extends NodeParamsConfig {
// 	time = ParamConfig.FLOAT('$T', {
// 		range: [0, 10],
// 		step: 0.0001,
// 	});

// 	reset = ParamConfig.BUTTON(null, {
// 		callback: (node: BaseNodeType, param: BaseParamType) => {
// 			AnimationMixerSopNode.PARAM_CALLBACK_reset(node as AnimationMixerSopNode, param);
// 		},
// 	});
// }
// const ParamsConfig = new AnimationMixerSopParamsConfig();

// export class AnimationMixerSopNode extends TypedSopNode<AnimationMixerSopParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'animationMixer';
// 	}

// 	// private _previousTime: number | undefined;
// 	private _mixer: AnimationMixer | undefined;

// 	static override displayedInputNames(): string[] {
// 		return ['objects to be animated'];
// 	}

// 	override initializeNode() {
// 		this.io.inputs.setCount(1);
// 		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
// 	}

// 	override async cook(inputCoreGroups: CoreGroup[]) {
// 		const inputCoreGroup = inputCoreGroups[0];
// 		const object = inputCoreGroup.objects()[0];
// 		if (object) {
// 			await this._createMixerIfRequired(object);
// 			this._updateMixer();
// 		}
// 		this.setObjects([object]);
// 	}

// 	private async _createMixerIfRequired(object: Object3D) {
// 		if (!this._mixer) {
// 			const mixer = await this._createMixer(object);
// 			if (mixer) {
// 				this._mixer = mixer;
// 			}
// 		}
// 	}

// 	private async _createMixer(object: Object3D) {
// 		const mixer = new AnimationMixer(object);
// 		console.log('create mixer', mixer, object);
// 		const animations = object.animations;

// 		object.traverse((child) => (child.matrixAutoUpdate = true));

// 		if (animations) {
// 			const animation = animations[0];
// 			const action = mixer.clipAction(animation);
// 			console.log(object, mixer, animation, action);
// 			action.play();
// 		}

// 		return mixer;
// 	}

// 	private _updateMixer() {
// 		this._setMixerTime();
// 		// this._update_mixer_weights();
// 	}
// 	private _setMixerTime() {
// 		// if (this.pv.time != this._previousTime) {
// 		if (this._mixer) {
// 			// this._mixer.setTime(this.pv.time);
// 			console.log(this.scene().timeController.timeDelta());
// 			this._mixer.update(this.scene().timeController.timeDelta());

// 			const root = this._mixer.getRoot();
// 			if ((root as Object3D).matrixAutoUpdate != null) {
// 				const object = root as Object3D;
// 				if (!object.matrixAutoUpdate) {
// 					object.updateMatrix();
// 				}
// 			}
// 		}
// 		// this._previousTime = this.pv.time;
// 		// }
// 	}

// 	static PARAM_CALLBACK_reset(node: AnimationMixerSopNode, param: BaseParamType) {
// 		param.setDirty();
// 		node._resetAnimationMixer();
// 	}
// 	private async _resetAnimationMixer() {
// 		this._mixer = undefined;
// 		// this._previousTime = undefined;
// 		this.setDirty();
// 	}
// }
