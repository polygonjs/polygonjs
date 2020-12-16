/**
 * Jitter the input points
 *
 * @remarks
 * This can be useful to add amounts of disturbance in the geometry. Either to debug it, or to remove a bit of its smoothness.
 */
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedSopNode} from './_Base';
import {JitterSopOperation} from '../../../core/operations/sop/Jitter';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

const DEFAULT = JitterSopOperation.DEFAULT_PARAMS;
class JitterSopParamsConfig extends NodeParamsConfig {
	/** @param amount of jitter */
	amount = ParamConfig.FLOAT(DEFAULT.amount);
	/** @param mult of each axis */
	mult = ParamConfig.VECTOR3(DEFAULT.mult);
	/** @param seed used to set the direction each point is moved to */
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
		this.io.inputs.init_inputs_cloned_state(JitterSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: JitterSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new JitterSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
