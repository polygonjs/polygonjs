/**
 * Creates a 2D ellipse.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';

class Ellipse2DCadParamsConfig extends NodeParamsConfig {
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
}
const ParamsConfig = new Ellipse2DCadParamsConfig();

export class Ellipse2DCadNode extends TypedCadNode<Ellipse2DCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ellipse2D';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const axis = new oc.gp_Ax22d_1();
		const majorRadius = Math.max(this.pv.majorRadius, this.pv.minorRadius);
		const minorRadius = Math.min(this.pv.majorRadius, this.pv.minorRadius);
		const ellipse = new oc.Geom2d_Ellipse_3(axis, majorRadius, minorRadius);

		this.setGeom2dCurve(ellipse);
	}
}
