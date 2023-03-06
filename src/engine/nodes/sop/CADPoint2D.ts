/**
 * Creates a 2D point.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/cad/CadObject';
import {CadGeometryType} from '../../../core/geometry/cad/CadCommon';

class CADPoint2DSopParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new CADPoint2DSopParamsConfig();

export class CADPoint2DSopNode extends CADSopNode<CADPoint2DSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_POINT_2D;
	}

	override async cook() {
		const oc = await CadLoader.core();

		const point = new oc.gp_Pnt2d_3(this.pv.center.x, this.pv.center.y);
		const cadObject = new CadObject(point, CadGeometryType.POINT_2D);
		this.setCADObject(cadObject);
	}
}
