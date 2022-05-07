/**
 * Creates a geodesic sphere.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
const {geodesicSphere} = jscad.primitives;

class GeodesicSphereCsgParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1);
	/** @param frequency */
	frequency = ParamConfig.INTEGER(8, {
		range: [1, 32],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new GeodesicSphereCsgParamsConfig();

export class GeodesicSphereCsgNode extends TypedCsgNode<GeodesicSphereCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'geodesicSphere';
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const geo = geodesicSphere({
			radius: this.pv.radius,
			frequency: this.pv.frequency * 6, // mult by 6 here to make it more intuitive
		});
		this.setCsgCoreObject(geo);
	}
}
