/**
 * Just like the Box, with rounded bevels.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {RoundedBoxSopOperation} from '../../operations/sop/RoundedBox';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = RoundedBoxSopOperation.DEFAULT_PARAMS;
class RoundedBoxSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.VECTOR3(DEFAULT.size);
	/** @param divisions count */
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [1, 10],
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
	paramsConfig = ParamsConfig;
	static type() {
		return 'roundedBox';
	}

	static displayedInputNames(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(RoundedBoxSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: RoundedBoxSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new RoundedBoxSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
