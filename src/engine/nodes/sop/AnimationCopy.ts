import {TypedSopNode} from './_Base';
// import {CoreTransform} from '../../../Core/Transform';
// import {ParamType} from '../../../Engine/Param/_Module'

// interface ActionsByName {
// 	[propName: string]: THREE.AnimationClip;
// }

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3DWithAnimation} from '../../../core/geometry/Animation';
class AnimationCopySopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AnimationCopySopParamsConfig();

export class AnimationCopySopNode extends TypedSopNode<AnimationCopySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animationCopy';
	}

	static displayed_input_names(): string[] {
		return ['geometry to copy animation to', 'geometry to copy animation from'];
	}

	initialize_node() {
		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group_target = input_contents[0];
		const core_group_src = input_contents[1];

		const src_object = core_group_src.objects()[0] as Object3DWithAnimation;
		const target_object = core_group_target.objects()[0] as Object3DWithAnimation;

		const src_animations = src_object.animations;
		if (src_animations) {
			target_object.animations = src_animations.map((a) => a.clone());
			this.set_core_group(core_group_target);
		} else {
			this.states.error.set('no animation found');
		}
	}
}
