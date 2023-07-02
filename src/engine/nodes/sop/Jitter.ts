/**
 * Jitter the input points
 *
 * @remarks
 * This can be useful to add amounts of disturbance in the geometry. Either to debug it, or to remove a bit of its smoothness.
 */
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedSopNode} from './_Base';
import {JitterSopOperation} from '../../operations/sop/Jitter';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = JitterSopOperation.DEFAULT_PARAMS;
class JitterSopParamsConfig extends NodeParamsConfig {
	/** @param amount of jitter */
	amount = ParamConfig.FLOAT(DEFAULT.amount);
	/** @param mult of each axis */
	mult = ParamConfig.VECTOR3(DEFAULT.mult);
	/** @param seed used to set the direction each point is moved to */
	seed = ParamConfig.INTEGER(DEFAULT.seed, {range: [0, 100]});
}
const ParamsConfig = new JitterSopParamsConfig();

export class JitterSopNode extends TypedSopNode<JitterSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.JITTER;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(JitterSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: JitterSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new JitterSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
