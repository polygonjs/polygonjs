import {CoreGroup} from '../../../core/geometry/Group';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {JitterSopOperation} from '../../../core/operation/sop/Jitter';

const DEFAULT = JitterSopOperation.DEFAULT_PARAMS;
class JitterSopParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(DEFAULT.amount);
	seed = ParamConfig.INTEGER(DEFAULT.seed, {range: [0, 100]});
}
const ParamsConfig = new JitterSopParamsConfig();

export class JitterSopNode extends TypedSopNode<JitterSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'jitter';
	}

	static displayed_input_names(): string[] {
		return ['geometry to jitter points of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE]);
	}

	private _operation: JitterSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new JitterSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
