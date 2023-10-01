/**
 * Creates a CAD 2D circle.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/modules/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/modules/cad/CadLoader';
import {cadGeom2dCurveTranslate} from '../../../core/geometry/modules/cad/toObject3D/CadGeom2dCurve';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';
import {CadGC} from '../../../core/geometry/modules/cad/CadCommon';

class CADCircle2DSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});

	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CADCircle2DSopParamsConfig();

export class CADCircle2DSopNode extends CADSopNode<CADCircle2DSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CIRCLE_2D;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		CadGC.withGC((r) => {
			const axis = r(new oc.gp_Ax22d_1());
			const circle = new oc.Geom2d_Circle_3(axis, this.pv.radius);
			cadGeom2dCurveTranslate(circle, this.pv.center);

			this.setCADGeom2dCurve(circle);
		});
	}
}
