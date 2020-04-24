import {TypedSopNode} from './_Base';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {AnimationClip, VectorKeyframeTrack, QuaternionKeyframeTrack} from 'three';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TestAnimationSopParamsConfig extends NodeParamsConfig {
	time = ParamConfig.FLOAT('$T');

	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			TestAnimationSopNode.PARAM_CALLBACK_reset(node as TestAnimationSopNode, param);
		},
	});
}
const ParamsConfig = new TestAnimationSopParamsConfig();

export class TestAnimationSopNode extends TypedSopNode<TestAnimationSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'test_animation';
	}
	private _mixer: AnimationMixer | undefined;

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const mixer = this._create_mixer_if_required(core_group);
		mixer.setTime(this.scene.time);

		this.set_core_group(core_group);
	}

	private _create_mixer_if_required(core_group: CoreGroup) {
		return (this._mixer = this._mixer || this._create_mixer(core_group));
	}

	private _create_mixer(core_group: CoreGroup) {
		const core_object = core_group.core_objects()[0];
		const object = core_object.object();
		const mixer = new AnimationMixer(object);
		const clip = this._create_clip();
		const action = mixer.clipAction(clip);
		action.play();
		return mixer;
	}

	private _create_clip() {
		const times = [0, 1, 2];
		const valuest: number[] = [0, 0, 0, 1, 2, 1, 2, -1, 1];
		const trackt = new VectorKeyframeTrack('.position', times, valuest);
		const valuesr: number[] = [0, 60, 45, 1, 180, 60, 12, 1, 25, -100, 100, 1];
		const trackr = new QuaternionKeyframeTrack('.quaternion', times, valuesr);
		console.log(trackr);
		const valuess: number[] = [0.5, 0.6, 0.7, 1, 2, 1, 2, 0.7, 1];
		const tracks = new VectorKeyframeTrack('.scale', times, valuess);

		const duration = 2;
		return new AnimationClip('test', duration, [trackt, trackr, tracks]);
	}

	static PARAM_CALLBACK_reset(node: TestAnimationSopNode, param: BaseParamType) {
		node.reset_mixer();
	}
	private reset_mixer() {
		this._mixer = undefined;
		this.set_dirty();
	}
}
