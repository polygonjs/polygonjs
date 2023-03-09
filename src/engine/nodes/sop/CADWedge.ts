/**
 * Creates a CAD wedge.
 *
 *
 */

import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/cad/CadConstant';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadShapeTranslate} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';
import {Vector3} from 'three';

const size = new Vector3();
const centerOffset = new Vector3();

class CADWedgeSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		step,
	});
	/** @param sizes */
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param end width */
	endWidth = ParamConfig.FLOAT(0.5);
}
const ParamsConfig = new CADWedgeSopParamsConfig();

export class CADWedgeSopNode extends CADSopNode<CADWedgeSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_WEDGE;
	}

	override async cook() {
		const oc = await CadLoader.core(this);
		size.copy(this.pv.sizes).multiplyScalar(this.pv.size);
		const api = new oc.BRepPrimAPI_MakeWedge_1(size.x, size.y, size.z, this.pv.endWidth);
		centerOffset.copy(size).multiplyScalar(-0.5);
		const centered = cadShapeTranslate(api.Shape(), centerOffset);
		const shape = cadShapeTranslate(centered, this.pv.center);
		api.delete();
		this.setCADShape(shape);
	}
}
