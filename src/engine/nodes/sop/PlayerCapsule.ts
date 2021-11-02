/**
 * Just like the Box, with rounded bevels.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PlayerCapsuleSopOperation} from '../../operations/sop/PlayerCapsule';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = PlayerCapsuleSopOperation.DEFAULT_PARAMS;
class PlayerCapsuleSopParamsConfig extends NodeParamsConfig {
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
}
const ParamsConfig = new PlayerCapsuleSopParamsConfig();

export class PlayerCapsuleSopNode extends TypedSopNode<PlayerCapsuleSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'playerCapsule';
	}

	initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: PlayerCapsuleSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PlayerCapsuleSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
