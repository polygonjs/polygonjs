import {TypedSopNode} from './_Base';
import {TorusSopOperation} from '../../../core/operations/sop/Torus';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TorusSopOperation.DEFAULT_PARAMS;
class TorusSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(DEFAULT.radius, {range: [0, 1]});
	radius_tube = ParamConfig.FLOAT(DEFAULT.radius_tube, {range: [0, 1]});
	segments_radial = ParamConfig.INTEGER(DEFAULT.segments_radial, {
		range: [1, 50],
		range_locked: [true, false],
	});
	segments_tube = ParamConfig.INTEGER(DEFAULT.segments_tube, {
		range: [1, 50],
		range_locked: [true, false],
	});
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
