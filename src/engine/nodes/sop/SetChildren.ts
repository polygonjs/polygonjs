/**
 * Sets the children
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SetChildrenSopOperation} from '../../operations/sop/SetChildren';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = SetChildrenSopOperation.DEFAULT_PARAMS;
class SetChildrenSopParamsConfig extends NodeParamsConfig {
	clearExistingChildren = ParamConfig.BOOLEAN(DEFAULT.clearExistingChildren);
}
const ParamsConfig = new SetChildrenSopParamsConfig();

export class SetChildrenSopNode extends TypedSopNode<SetChildrenSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SET_CHILDREN;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(SetChildrenSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: SetChildrenSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new SetChildrenSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(core_group);
	}
}
