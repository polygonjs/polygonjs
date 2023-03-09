/**
 * Creates a CAD tube.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadShapeTranslate} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';
import {cadAxis} from '../../../core/geometry/cad/CadMath';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';

class CADTubeSopParamsConfig extends NodeParamsConfig {
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
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
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
const ParamsConfig = new CADTubeSopParamsConfig();

export class CADTubeSopNode extends CADSopNode<CADTubeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_TUBE;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		const axis = cadAxis(this.pv.axis);

		const api = this.pv.closed
			? new oc.BRepPrimAPI_MakeCylinder_3(axis, this.pv.radius, this.pv.height)
			: new oc.BRepPrimAPI_MakeCylinder_4(axis, this.pv.radius, this.pv.height, this.pv.angle);

		const shape = cadShapeTranslate(api.Shape(), this.pv.center);
		api.delete();
		this.setCADShape(shape);
	}
}
