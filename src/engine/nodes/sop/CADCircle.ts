/**
 * Creates a CAD circle.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/modules/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/modules/cad/CadLoader';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';
import {CoreGroup} from '../../../core/geometry/Group';
import {cadEdgeCreate} from '../../../core/geometry/modules/cad/toObject3D/CadEdge';

class CADCircleSopParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new CADCircleSopParamsConfig();

export class CADCircleSopNode extends CADSopNode<CADCircleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_CIRCLE;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core(this);
		const axis1 = CadLoaderSync.gp_Ax1;
		const dir = CadLoaderSync.gp_Dir;
		dir.SetCoord_2(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
		axis1.SetDirection(dir);
		const axis = CadLoaderSync.gp_Ax2;
		axis.SetAxis(axis1);
		const circle = new oc.Geom_Circle_2(axis, this.pv.radius);

		const t = CadLoaderSync.gp_Vec;
		t.SetCoord_2(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		circle.Translate_1(t);

		const edge = cadEdgeCreate(oc, circle);
		this.setCADShape(edge);
	}
}
