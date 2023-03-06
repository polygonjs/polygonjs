/**
 * Creates a CAD point.
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadVertexCreate} from '../../../core/geometry/cad/toObject3D/CadVertex';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGroup} from '../../../core/geometry/Group';

class CADPointSopParamsConfig extends NodeParamsConfig {
	/** @param translate */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CADPointSopParamsConfig();

export class CADPointSopNode extends CADSopNode<CADPointSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_POINT;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const oc = await CadLoader.core();
		const vertex = cadVertexCreate(oc, this.pv.center);
		this.setCADShape(vertex);
	}
}
