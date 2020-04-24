import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
class DelaySopParamsConfig extends NodeParamsConfig {
	duration = ParamConfig.INTEGER(1000, {
		range: [0, 1000],
		range_locked: [true, false],
	});
}
const ParamsConfig = new DelaySopParamsConfig();

export class DelaySopNode extends TypedSopNode<DelaySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'delay';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.ALWAYS]);
	}

	cook(inputs_contents: CoreGroup[]) {
		const core_group = inputs_contents[0];
		const c = () => {
			this.set_core_group(core_group);
		};
		setTimeout(c, Math.max(this.pv.duration, 0));
	}
}
