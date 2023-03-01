/**
 * Creates a 2D point.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';

class Point2DCadParamsConfig extends NodeParamsConfig {
	/** @param translate */
	t = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new Point2DCadParamsConfig();

export class Point2DCadNode extends TypedCadNode<Point2DCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'point2D';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();

		const point = new oc.gp_Pnt2d_3(this.pv.t.x, this.pv.t.y);

		this.setPoint2D(point);
	}
}
