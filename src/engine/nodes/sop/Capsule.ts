/**
 * Just like the Box, with rounded bevels.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CapsuleSopOperation} from '../../operations/sop/Capsule';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = CapsuleSopOperation.DEFAULT_PARAMS;
class CapsuleSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param height */
	height = ParamConfig.FLOAT(DEFAULT.height, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param divisions */
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CapsuleSopParamsConfig();

export class CapsuleSopNode extends TypedSopNode<CapsuleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'capsule';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: CapsuleSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new CapsuleSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
