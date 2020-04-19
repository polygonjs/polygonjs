import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
class PhysicsRBDAttributesSopParamsConfig extends NodeParamsConfig {
	active = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new PhysicsRBDAttributesSopParamsConfig();

export class PhysicsRBDAttributesSopNode extends TypedSopNode<PhysicsRBDAttributesSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'physics_rbd_attributes';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		console.error('physics attributes cook');
		this.set_core_group(input_contents[0]);
	}
}
