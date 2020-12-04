import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {ScatterSopOperation} from '../../../core/operations/sop/Scatter';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ScatterSopOperation.DEFAULT_PARAMS;
class ScatterSopParamsConfig extends NodeParamsConfig {
	points_count = ParamConfig.INTEGER(DEFAULT.points_count, {
		range: [0, 100],
		range_locked: [true, false],
	});
	seed = ParamConfig.INTEGER(DEFAULT.seed, {
		range: [0, 100],
		range_locked: [false, false],
	});
	transfer_attributes = ParamConfig.BOOLEAN(DEFAULT.transfer_attributes);
	attributes_to_transfer = ParamConfig.STRING(DEFAULT.attributes_to_transfer, {
		visible_if: {transfer_attributes: 1},
	});
	add_id_attribute = ParamConfig.BOOLEAN(DEFAULT.add_id_attribute);
	add_idn_attribute = ParamConfig.BOOLEAN(DEFAULT.add_idn_attribute);
}
const ParamsConfig = new ScatterSopParamsConfig();

export class ScatterSopNode extends TypedSopNode<ScatterSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'scatter';
	}

	static displayed_input_names(): string[] {
		return ['geometry to scatter points onto'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	private _operation: ScatterSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new ScatterSopOperation(this.scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
