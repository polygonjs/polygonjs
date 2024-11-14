/**
 * Measure primitives area.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MeasureSopOperation} from '../../operations/sop/Measure';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = MeasureSopOperation.DEFAULT_PARAMS;
class MeasureSopParamConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	attribName = ParamConfig.STRING(DEFAULT.attribName);
}
const ParamsConfig = new MeasureSopParamConfig();

export class MeasureSopNode extends TypedSopNode<MeasureSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.MEASURE;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MeasureSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MeasureSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new MeasureSopOperation(this.scene(), this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
