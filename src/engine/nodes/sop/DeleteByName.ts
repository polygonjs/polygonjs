/**
 * Deletes input objects by name
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DeleteByNameSopOperation} from '../../operations/sop/DeleteByName';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = DeleteByNameSopOperation.DEFAULT_PARAMS;
class DeleteByNameSopParamConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param invert */
	invert = ParamConfig.BOOLEAN(DEFAULT.invert);
}
const ParamsConfig = new DeleteByNameSopParamConfig();

export class DeleteByNameSopNode extends TypedSopNode<DeleteByNameSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.DELETE_BY_NAME;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(DeleteByNameSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: DeleteByNameSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new DeleteByNameSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
