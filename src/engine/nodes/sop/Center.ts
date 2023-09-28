/**
 * Creates a point at the center of each input objects
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CenterSopOperation, CENTER_MODES} from '../../operations/sop/Center';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = CenterSopOperation.DEFAULT_PARAMS;
class CenterSopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: CENTER_MODES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new CenterSopParamsConfig();

export class CenterSopNode extends TypedSopNode<CenterSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'center';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CenterSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CenterSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new CenterSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
