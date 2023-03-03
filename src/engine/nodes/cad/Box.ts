/**
 * Creates a cube.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {CadType} from '../../poly/registers/nodes/types/Cad';
import {cadShapeTranslate} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';

class BoxCadParamsConfig extends NodeParamsConfig {
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
	/** @param bevel */
	rounded = ParamConfig.BOOLEAN(0);
	/** @param bevel radius */
	roundedRadius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
	/** @param bevel segments */
	roundedSegments = ParamConfig.INTEGER(4, {
		range: [1, 8],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
}
const ParamsConfig = new BoxCadParamsConfig();

export class BoxCadNode extends TypedCadNode<BoxCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CadType.BOX;
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const api = new oc.BRepPrimAPI_MakeBox_2(
			this.pv.sizes.x * this.pv.size,
			this.pv.sizes.y * this.pv.size,
			this.pv.sizes.z * this.pv.size
		);
		const shape = cadShapeTranslate(api.Shape(), this.pv.center);

		this.setShell(shape);
	}
}
