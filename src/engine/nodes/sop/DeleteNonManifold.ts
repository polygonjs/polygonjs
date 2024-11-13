/**
 * Deletes non-manifold faces.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DeleteNonManifoldSopOperation} from '../../operations/sop/DeleteNonManifold';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = DeleteNonManifoldSopOperation.DEFAULT_PARAMS;
class DeleteNonManifoldSopParamConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	invert = ParamConfig.BOOLEAN(DEFAULT.invert);
}
const ParamsConfig = new DeleteNonManifoldSopParamConfig();

export class DeleteNonManifoldSopNode extends TypedSopNode<DeleteNonManifoldSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.DELETE_NON_MANIFOLD;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(DeleteNonManifoldSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: DeleteNonManifoldSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new DeleteNonManifoldSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
