/**
 * Moves points alongside the normal.
 *
 * @remarks
 * This can be useful to inflate or deflate quickly some objects.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';

import {PeakSopOperation} from '../../../core/operations/sop/Peak';
const DEFAULT = PeakSopOperation.DEFAULT_PARAMS;
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class PeakSopParamsConfig extends NodeParamsConfig {
	/** @param amount the points will be moved */
	amount = ParamConfig.FLOAT(DEFAULT.amount, {range: [-1, 1]});
}
const ParamsConfig = new PeakSopParamsConfig();

export class PeakSopNode extends TypedSopNode<PeakSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'peak';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	private _operation: PeakSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PeakSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
