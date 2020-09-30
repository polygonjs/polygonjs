import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AttribAddMultSopOperation} from '../../../core/operation/sop/AttribAddMult';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribAddMultSopOperation.DEFAULT_PARAMS;
class AttribAddMultSopParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING(DEFAULT.name);
	pre_add = ParamConfig.FLOAT(DEFAULT.pre_add, {range: [0, 1]});
	mult = ParamConfig.FLOAT(DEFAULT.mult, {range: [0, 1]});
	post_add = ParamConfig.FLOAT(DEFAULT.post_add, {range: [0, 1]});
}
const ParamsConfig = new AttribAddMultSopParamsConfig();

export class AttribAddMultSopNode extends TypedSopNode<AttribAddMultSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_add_mult';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(AttribAddMultSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribAddMultSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribAddMultSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
