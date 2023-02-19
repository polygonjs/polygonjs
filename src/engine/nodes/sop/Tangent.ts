/**
 * Creates a tangent attribute
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TangentSopOperation} from '../../operations/sop/Tangent';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = TangentSopOperation.DEFAULT_PARAMS;
class TangentSopParamsConfig extends NodeParamsConfig {
	/** @param closed */
	closed = ParamConfig.BOOLEAN(DEFAULT.closed);

	/** @param tangent attribute name */
	tangentName = ParamConfig.STRING(DEFAULT.tangentName);
}
const ParamsConfig = new TangentSopParamsConfig();

export class TangentSopNode extends TypedSopNode<TangentSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TANGENT;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(TangentSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: TangentSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new TangentSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
