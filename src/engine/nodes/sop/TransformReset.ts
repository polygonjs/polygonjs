import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class TransformResetSopParamConfig extends NodeParamsConfig {}
const ParamsConfig = new TransformResetSopParamConfig();

export class TransformResetSopNode extends TypedSopNode<TransformResetSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transform_reset';
	}

	static displayed_input_names(): string[] {
		return ['objects to reset transform'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const objects = core_group.objects();
		for (let object of objects) {
			object.position.set(0, 0, 0);
			object.rotation.set(0, 0, 0);
			object.scale.set(1, 1, 1);
		}

		this.set_core_group(core_group);
	}
}
