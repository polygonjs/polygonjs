import {TypedSopNode} from './_Base';
import {IcosahedronSopOperation} from '../../../core/operation/sop/Icosahedron';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = IcosahedronSopOperation.DEFAULT_PARAMS;
class IcosahedronSopParamsConfig extends NodeParamsConfig {
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	detail = ParamConfig.INTEGER(DEFAULT.detail, {
		range: [0, 10],
		range_locked: [true, false],
	});
	points_only = ParamConfig.BOOLEAN(DEFAULT.points_only);
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new IcosahedronSopParamsConfig();

export class IcosahedronSopNode extends TypedSopNode<IcosahedronSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'icosahedron';
	}

	private _operation: IcosahedronSopOperation | undefined;
	cook() {
		this._operation = this._operation || new IcosahedronSopOperation(this._scene, this.states);
		const core_group = this._operation.cook([], this.pv);
		this.set_core_group(core_group);
	}
}
