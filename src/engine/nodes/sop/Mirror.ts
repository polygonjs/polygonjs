/**
 * Transform input geometries or objects.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MirrorSopOperation} from '../../operations/sop/Mirror';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = MirrorSopOperation.DEFAULT_PARAMS;
class MirrorSopParamConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param axis */
	axis = ParamConfig.VECTOR3(DEFAULT.axis);
	/** @param center */
	center = ParamConfig.VECTOR3(DEFAULT.center);
	/** @param preserve input */
	preserveInput = ParamConfig.BOOLEAN(DEFAULT.preserveInput);
}
const ParamsConfig = new MirrorSopParamConfig();

export class MirrorSopNode extends TypedSopNode<MirrorSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.MIRROR;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MirrorSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MirrorSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new MirrorSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
