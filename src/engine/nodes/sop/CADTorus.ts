/**
 * Creates a CAD torus.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/modules/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/modules/cad/CadLoader';
import {cadAxis} from '../../../core/geometry/modules/cad/CadMath';
import {cadShapeTranslate} from '../../../core/geometry/modules/cad/toObject3D/CadShapeCommon';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';

class CADTorusSopParamsConfig extends NodeParamsConfig {
	/** @param outer radius */
	outerRadius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param inner radius */
	innerRadius = ParamConfig.FLOAT(0.5, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param closed */
	closed = ParamConfig.BOOLEAN(true);

	/** @param phi */
	phi = ParamConfig.FLOAT(`2*$PI`, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, true],
		step,
		visibleIf: {closed: false},
	});
}
const ParamsConfig = new CADTorusSopParamsConfig();

export class CADTorusSopNode extends CADSopNode<CADTorusSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_TORUS;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		const axis = cadAxis(this.pv.axis);
		const api = this.pv.closed
			? new oc.BRepPrimAPI_MakeTorus_5(axis, this.pv.outerRadius, this.pv.innerRadius)
			: new oc.BRepPrimAPI_MakeTorus_6(axis, this.pv.outerRadius, this.pv.innerRadius, this.pv.phi);

		const shape = cadShapeTranslate(api.Shape(), this.pv.center);
		api.delete();
		this.setCADShape(shape);
	}
}
