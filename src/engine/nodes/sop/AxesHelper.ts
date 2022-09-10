/**
 * Creates a axes helper.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AxesHelperSopOperation} from '../../operations/sop/AxesHelper';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class AxesHelperSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AxesHelperSopParamsConfig();

export class AxesHelperSopNode extends TypedSopNode<AxesHelperSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'axesHelper';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: AxesHelperSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AxesHelperSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
