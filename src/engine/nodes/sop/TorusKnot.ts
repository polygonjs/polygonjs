import {TypedSopNode} from './_Base';
import {TorusKnotSopOperation} from '../../../core/operations/sop/TorusKnot';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TorusKnotSopOperation.DEFAULT_PARAMS;
class TorusKnotSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	radius_tube = ParamConfig.FLOAT(DEFAULT.radius_tube);
	segments_radial = ParamConfig.INTEGER(DEFAULT.segments_radial, {range: [1, 128]});
	segments_tube = ParamConfig.INTEGER(DEFAULT.segments_tube, {range: [1, 32]});
	p = ParamConfig.INTEGER(DEFAULT.p, {range: [1, 10]});
	q = ParamConfig.INTEGER(DEFAULT.q, {range: [1, 10]});
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new TorusKnotSopParamsConfig();

export class TorusKnotSopNode extends TypedSopNode<TorusKnotSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'torus_knot';
	}
	initialize_node() {}

	private _operation: TorusKnotSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TorusKnotSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
