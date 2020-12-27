/**
 * Creates a torus.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {TorusSopOperation} from '../../../core/operations/sop/Torus';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TorusSopOperation.DEFAULT_PARAMS;
class TorusSopParamsConfig extends NodeParamsConfig {
	/** @param large radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius, {range: [0, 1]});
	/** @param radius of the tube */
	radius_tube = ParamConfig.FLOAT(DEFAULT.radius_tube, {range: [0, 1]});
	/** @param number of segments along the length of the torus */
	segments_radial = ParamConfig.INTEGER(DEFAULT.segments_radial, {
		range: [1, 50],
		rangeLocked: [true, false],
	});
	/** @param number of segments along the tube */
	segments_tube = ParamConfig.INTEGER(DEFAULT.segments_tube, {
		range: [1, 50],
		rangeLocked: [true, false],
	});
	/** @param center of the torus */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new TorusSopParamsConfig();

export class TorusSopNode extends TypedSopNode<TorusSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'torus';
	}

	private _operation: TorusSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TorusSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
