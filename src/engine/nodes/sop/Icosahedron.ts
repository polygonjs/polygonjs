/**
 * Creates an Isocahedron
 *
 * @remarks
 * This is similar to a sphere, but with hexagonal patterns
 */
import {TypedSopNode} from './_Base';
import {IcosahedronSopOperation} from '../../../core/operations/sop/Icosahedron';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = IcosahedronSopOperation.DEFAULT_PARAMS;
class IcosahedronSopParamsConfig extends NodeParamsConfig {
	/** @param radius of the icosahedron */
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	/** @param resolution of the icosahedron */
	detail = ParamConfig.INTEGER(DEFAULT.detail, {
		range: [0, 10],
		range_locked: [true, false],
	});
	/** @param do not create polygons, only points. */
	points_only = ParamConfig.BOOLEAN(DEFAULT.points_only);
	/** @param center of the icosahedron */
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
