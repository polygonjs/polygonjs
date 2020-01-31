import {TypedSopNode} from './_Base';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {CoreGroup} from 'src/core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class ShadowsSopParamsConfig extends NodeParamsConfig {
	cast_shadow = ParamConfig.BOOLEAN(1);
	receive_shadow = ParamConfig.BOOLEAN(1);
	apply_to_children = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new ShadowsSopParamsConfig();

export class ShadowsSopNode extends TypedSopNode<ShadowsSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'shadows';
	}

	static displayed_input_names(): string[] {
		return ['objects to change shadows properties of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		for (let object of core_group.objects()) {
			if (this.pv.apply_to_children) {
				object.traverse((child) => {
					child.castShadow = this.pv.cast_shadow;
					child.receiveShadow = this.pv.receive_shadow;
				});
			} else {
				object.castShadow = this.pv.cast_shadow;
				object.receiveShadow = this.pv.receive_shadow;
			}
		}

		console.log(core_group.objects());
		this.set_core_group(core_group);
	}
}
