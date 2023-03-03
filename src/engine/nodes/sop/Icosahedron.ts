/**
 * Creates an Isocahedron
 *
 * @remarks
 * This is similar to a sphere, but with hexagonal patterns
 */
import {TypedSopNode} from './_Base';
import {IcosahedronSopOperation} from '../../operations/sop/Icosahedron';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = IcosahedronSopOperation.DEFAULT_PARAMS;
class IcosahedronSopParamsConfig extends NodeParamsConfig {
	/** @param radius of the icosahedron */
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	/** @param resolution of the icosahedron */
	detail = ParamConfig.INTEGER(DEFAULT.detail, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param do not create polygons, only points. */
	pointsOnly = ParamConfig.BOOLEAN(DEFAULT.pointsOnly);
	/** @param center of the icosahedron */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new IcosahedronSopParamsConfig();

export class IcosahedronSopNode extends TypedSopNode<IcosahedronSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ICOSAHEDRON;
	}

	private _operation: IcosahedronSopOperation | undefined;
	override cook() {
		this._operation = this._operation || new IcosahedronSopOperation(this._scene, this.states);
		const core_group = this._operation.cook([], this.pv);
		this.setCoreGroup(core_group);
	}
}
