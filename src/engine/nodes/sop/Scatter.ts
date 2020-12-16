/**
 * Scatter points onto a geometry
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {ScatterSopOperation} from '../../../core/operations/sop/Scatter';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ScatterSopOperation.DEFAULT_PARAMS;
class ScatterSopParamsConfig extends NodeParamsConfig {
	/** @param number of points to create */
	points_count = ParamConfig.INTEGER(DEFAULT.points_count, {
		range: [0, 100],
		range_locked: [true, false],
	});
	/** @param seed to affect the distribution of points */
	seed = ParamConfig.INTEGER(DEFAULT.seed, {
		range: [0, 100],
		range_locked: [false, false],
	});
	/** @param toggle on to transfer attribute from the input geometry to the created points */
	transfer_attributes = ParamConfig.BOOLEAN(DEFAULT.transfer_attributes);
	/** @param names of the attributes to transfer */
	attributes_to_transfer = ParamConfig.STRING(DEFAULT.attributes_to_transfer, {
		visible_if: {transfer_attributes: 1},
	});
	/** @param add an id attribute, starting at 0, incrementing by 1 for each point (0,1,2,3...) */
	add_id_attribute = ParamConfig.BOOLEAN(DEFAULT.add_id_attribute);
	/** @param add an idn attribute, which is the id normalized between 0 and 1 */
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
