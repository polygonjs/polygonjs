import {TypedSopNode} from './_Base';
import {CircleSopOperation} from '../../../core/operation/sop/Circle';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = CircleSopOperation.DEFAULT_PARAMS;
class CircleSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	segments = ParamConfig.INTEGER(DEFAULT.segments, {
		range: [1, 50],
		range_locked: [true, false],
	});
	open = ParamConfig.BOOLEAN(DEFAULT.open);
	arc_angle = ParamConfig.FLOAT(DEFAULT.arc_angle, {
		range: [0, 360],
		range_locked: [false, false],
		visible_if: {open: 1},
	});
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
}
const ParamsConfig = new CircleSopParamsConfig();

export class CircleSopNode extends TypedSopNode<CircleSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'circle';
	}

	initialize_node() {
		// this.io.inputs.set_count(0);
		// this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	private _operation = new CircleSopOperation();
	cook() {
		const core_group = this._operation.cook([], this.pv);
		this.set_core_group(core_group);
	}
}
