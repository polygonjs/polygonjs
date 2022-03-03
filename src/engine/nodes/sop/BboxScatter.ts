/**
 * scatters points inside the bounding box of an object
 *
 * @remarks
 * This can be useful to quickly create points in a volume.
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BboxScatterSopOperation} from '../../operations/sop/BboxScatter';
class BboxScatterSopParamsConfig extends NodeParamsConfig {
	/** @param the smaller the step size, the more points this will create */
	stepSize = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new BboxScatterSopParamsConfig();

export class BboxScatterSopNode extends TypedSopNode<BboxScatterSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'bboxScatter';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to create points from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	private _operation: BboxScatterSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new BboxScatterSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
