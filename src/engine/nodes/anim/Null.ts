import {TypedAnimNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {AnimationClip} from 'three/src/animation/AnimationClip';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullAnimParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullAnimParamsConfig();

export class NullAnimNode extends TypedAnimNode<NullAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_clips: AnimationClip[]) {
		this.set_clip(input_clips[0]);
	}
}
