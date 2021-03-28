import {TypedSopNode} from './_Base';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseNodeType} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {Object3D} from 'three/src/core/Object3D';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseParamType} from '../../params/_Base';
class AnimationMixerSopParamsConfig extends NodeParamsConfig {
	time = ParamConfig.FLOAT('$T', {range: [0, 10]});
	clip = ParamConfig.OPERATOR_PATH('/ANIM/OUT', {
		nodeSelection: {
			context: NodeContext.ANIM,
		},
		dependentOnFoundNode: false,
	});
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			AnimationMixerSopNode.PARAM_CALLBACK_reset(node as AnimationMixerSopNode, param);
		},
	});
}
const ParamsConfig = new AnimationMixerSopParamsConfig();

export class AnimationMixerSopNode extends TypedSopNode<AnimationMixerSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'animationMixer';
	}

	private _previous_time: number | undefined;
	private _mixer: AnimationMixer | undefined;

	static displayedInputNames(): string[] {
		return ['geometry to be animated'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const object = core_group.objects()[0];
		if (object) {
			await this.create_mixer_if_required(object);
			this._update_mixer();
		}
		this.setObjects([object]);
	}

	private async create_mixer_if_required(object: Object3D) {
		if (!this._mixer) {
			const mixer = await this._create_mixer(object);
			if (mixer) {
				this._mixer = mixer;
			}
		}
	}

	private async _create_mixer(object: Object3D) {
		if (this.p.clip.isDirty()) {
			await this.p.clip.compute();
		}
		const anim_node = this.p.clip.found_node_with_context(NodeContext.ANIM);
		if (anim_node) {
			// const container = await anim_node.requestContainer();
			// const animation_clip = container.animation_clip();
			const mixer = new AnimationMixer(object);
			// const action = mixer.clipAction(animation_clip);

			// action.play();
			return mixer;
		}
	}

	private _update_mixer() {
		this._set_mixer_time();
		// this._update_mixer_weights();
	}
	private _set_mixer_time() {
		if (this.pv.time != this._previous_time) {
			if (this._mixer) {
				this._mixer.setTime(this.pv.time);
			}
			this._previous_time = this.pv.time;
		}
	}

	static PARAM_CALLBACK_reset(node: AnimationMixerSopNode, param: BaseParamType) {
		param.setDirty();
		node.reset_animation_mixer();
	}
	async reset_animation_mixer() {
		this._mixer = undefined;
		this._previous_time = undefined;
		this.setDirty();
	}
}
