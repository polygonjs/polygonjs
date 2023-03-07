/**
 * Creates a CAD ellipse.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {CadLoaderSync} from '../../../core/geometry/cad/CadLoaderSync';
import {CoreGroup} from '../../../core/geometry/Group';
import {cadEdgeCreate} from '../../../core/geometry/cad/toObject3D/CadEdge';

class CADEllipseSopParamsConfig extends NodeParamsConfig {
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
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CADEllipseSopParamsConfig();

export class CADEllipseSopNode extends CADSopNode<CADEllipseSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_ELLIPSE;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const axis1 = CadLoaderSync.gp_Ax1;
		const dir = CadLoaderSync.gp_Dir;
		dir.SetCoord_2(this.pv.axis.x, this.pv.axis.y, this.pv.axis.z);
		axis1.SetDirection(dir);
		const axis = CadLoaderSync.gp_Ax2;
		axis.SetAxis(axis1);
		const majorRadius = Math.max(this.pv.majorRadius, this.pv.minorRadius);
		const minorRadius = Math.min(this.pv.majorRadius, this.pv.minorRadius);
		const ellipse = new oc.Geom_Ellipse_2(axis, majorRadius, minorRadius);

		const t = CadLoaderSync.gp_Vec;
		t.SetCoord_2(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		ellipse.Translate_1(t);

		const edge = cadEdgeCreate(oc, ellipse);
		this.setCADShape(edge);
	}
}
