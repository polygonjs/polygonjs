/**
 * Simple math operation of a numeric attribute
 *
 * @remarks
 * This allows you to quickly add and multiply a numeric attribute of the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AttribAddMultSopOperation} from '../../../core/operations/sop/AttribAddMult';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribAddMultSopOperation.DEFAULT_PARAMS;
class AttribAddMultSopParamsConfig extends NodeParamsConfig {
	/** @param attribute name */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param value to add before the multiplication */
	pre_add = ParamConfig.FLOAT(DEFAULT.pre_add, {range: [0, 1]});
	/** @param value to multiply */
	mult = ParamConfig.FLOAT(DEFAULT.mult, {range: [0, 1]});
	/** @param value to add after the multiplication */
	post_add = ParamConfig.FLOAT(DEFAULT.post_add, {range: [0, 1]});
}
const ParamsConfig = new AttribAddMultSopParamsConfig();

export class AttribAddMultSopNode extends TypedSopNode<AttribAddMultSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribAddMult';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(AttribAddMultSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribAddMultSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribAddMultSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
