import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BoxSopOperation} from '../../../core/operation/sop/Box';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = BoxSopOperation.DEFAULT_PARAMS;
class BoxSopParamsConfig extends NodeParamsConfig {
	size = ParamConfig.FLOAT(DEFAULT.size);
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [1, 10],
		range_locked: [true, false],
	});
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new BoxSopParamsConfig();

export class BoxSopNode extends TypedSopNode<BoxSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'box';
	}

	static displayed_input_names(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	private _operation: BoxSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BoxSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
