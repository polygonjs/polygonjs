/**
 * Creates a axes helper.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AxesHelperSopOperation} from '../../operations/sop/AxesHelper';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = AxesHelperSopOperation.DEFAULT_PARAMS;
class AxesHelperSopParamsConfig extends NodeParamsConfig {
	/** @param center of the geometry */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new AxesHelperSopParamsConfig();

export class AxesHelperSopNode extends TypedSopNode<AxesHelperSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.AXES_HELPER;
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
