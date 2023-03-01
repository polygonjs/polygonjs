/**
 * Creates a cylinder.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';

class CylinderCadParamsConfig extends NodeParamsConfig {
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param height */
	height = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param closed */
	closed = ParamConfig.BOOLEAN(true);
	/** @param angle */
	angle = ParamConfig.FLOAT(`2*$PI`, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {closed: false},
	});
}
const ParamsConfig = new CylinderCadParamsConfig();

export class CylinderCadNode extends TypedCadNode<CylinderCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cylinder';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const axis = new oc.gp_Ax2_1();
		const dir = new oc.gp_Dir_4(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
		axis.SetDirection(dir);
		const api = this.pv.closed
			? new oc.BRepPrimAPI_MakeCylinder_3(axis, this.pv.radius, this.pv.height)
			: new oc.BRepPrimAPI_MakeCylinder_4(axis, this.pv.radius, this.pv.height, this.pv.angle);

		const tf = new oc.gp_Trsf_1();
		tf.SetTranslation_1(new oc.gp_Vec_4(this.pv.center.x, this.pv.center.y, this.pv.center.z));
		tf.SetScaleFactor(1);
		const loc = new oc.TopLoc_Location_2(tf);
		const shape = api.Shape().Moved(loc, false);

		this.setShell(shape);
	}
}
