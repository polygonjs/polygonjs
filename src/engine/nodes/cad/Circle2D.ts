/**
 * Creates a 2D circle.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadGeom2dCurveTranslate} from '../../../core/geometry/cad/toObject3D/CadGeom2dCurve';
import {CadType} from '../../poly/registers/nodes/types/Cad';

class Circle2DCadParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});

	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new Circle2DCadParamsConfig();

export class Circle2DCadNode extends TypedCadNode<Circle2DCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CadType.CIRCLE_2D;
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const axis = new oc.gp_Ax22d_1();
		const circle = new oc.Geom2d_Circle_3(axis, this.pv.radius);
		cadGeom2dCurveTranslate(circle, this.pv.center);

		this.setGeom2dCurve(circle);
	}
}
