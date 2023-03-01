/**
 * Creates a circle.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';

class CircleCadParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CircleCadParamsConfig();

export class CircleCadNode extends TypedCadNode<CircleCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'circle';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const dir = new oc.gp_Dir_4(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
		const axis1 = new oc.gp_Ax1_1();
		axis1.SetDirection(dir);
		const axis = new oc.gp_Ax2_1();
		axis.SetAxis(axis1);
		const circle = new oc.Geom_Circle_2(axis, this.pv.radius);

		const t = new oc.gp_Vec_3(new oc.gp_XYZ_2(this.pv.center.x, this.pv.center.y, this.pv.center.z));
		circle.Translate_1(t);

		const edge = cadEdgeCreate(oc, circle);
		this.setEdge(edge);
	}
}
