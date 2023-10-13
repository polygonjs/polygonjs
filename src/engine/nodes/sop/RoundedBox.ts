/**
 * Just like the Box, with rounded bevels.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {RoundedBoxSopOperation} from '../../operations/sop/RoundedBox';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = RoundedBoxSopOperation.DEFAULT_PARAMS;
class RoundedBoxSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.FLOAT(DEFAULT.size);
	/** @param size of the box */
	sizes = ParamConfig.VECTOR3(DEFAULT.sizes);
	/** @param divisions count */
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param bevel size */
	bevel = ParamConfig.FLOAT(DEFAULT.bevel, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param center of the box */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new RoundedBoxSopParamsConfig();

export class RoundedBoxSopNode extends TypedSopNode<RoundedBoxSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ROUNDED_BOX;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(RoundedBoxSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: RoundedBoxSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new RoundedBoxSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
