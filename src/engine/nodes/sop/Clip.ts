/**
 * Cuts a geometry with a plane.
 *
 * @remarks
 * The input geometry must have used a BVH SOP node before.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ClipSopOperation} from '../../operations/sop/Clip';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ClipSopOperation.DEFAULT_PARAMS;
class ClipSopParamsConfig extends NodeParamsConfig {
	/** @param origin */
	origin = ParamConfig.VECTOR3(DEFAULT.origin);
	/** @param distance */
	distance = ParamConfig.FLOAT(DEFAULT.distance, {
		range: [-10, 10],
		rangeLocked: [false, false],
	});
	/** @param direction */
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
}
const ParamsConfig = new ClipSopParamsConfig();

export class ClipSopNode extends TypedSopNode<ClipSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'clip';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ClipSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ClipSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new ClipSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
