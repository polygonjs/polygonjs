/**
 * Creates a CAD 2D ellipse.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/modules/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/modules/cad/CadLoader';
import {cadGeom2dCurveTranslate} from '../../../core/geometry/modules/cad/toObject3D/CadGeom2dCurve';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadGC} from '../../../core/geometry/modules/cad/CadCommon';

class CADEllipse2DSopParamsConfig extends NodeParamsConfig {
	/** @param major radius */
	majorRadius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param minor radius */
	minorRadius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param axis */
	// axis = ParamConfig.VECTOR2([0, 1]);
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CADEllipse2DSopParamsConfig();

export class CADEllipse2DSopNode extends CADSopNode<CADEllipse2DSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_ELLIPSE_2D;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		CadGC.withGC((r) => {
			const axis = r(new oc.gp_Ax22d_1());
			const majorRadius = Math.max(this.pv.majorRadius, this.pv.minorRadius);
			const minorRadius = Math.min(this.pv.majorRadius, this.pv.minorRadius);
			const ellipse = new oc.Geom2d_Ellipse_3(axis, majorRadius, minorRadius);
			cadGeom2dCurveTranslate(ellipse, this.pv.center);

			this.setCADGeom2dCurve(ellipse);
		});
	}
}
