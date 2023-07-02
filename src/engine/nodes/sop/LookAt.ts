/**
 * Transform input geometries or objects.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {LookAtSopOperation} from '../../operations/sop/LookAt';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = LookAtSopOperation.DEFAULT_PARAMS;
class LookAtSopParamConfig extends NodeParamsConfig {
	/** @param target */
	target = ParamConfig.VECTOR3(DEFAULT.target);
	/** @param up vector */
	up = ParamConfig.VECTOR3(DEFAULT.up);
	/** @param lerp */
	lerp = ParamConfig.FLOAT(DEFAULT.lerp, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param invertDirection */
	invertDirection = ParamConfig.BOOLEAN(DEFAULT.invertDirection);
}
const ParamsConfig = new LookAtSopParamConfig();

export class LookAtSopNode extends TypedSopNode<LookAtSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.LOOK_AT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(LookAtSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: LookAtSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new LookAtSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
