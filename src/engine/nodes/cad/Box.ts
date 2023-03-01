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
import {TopoDS_Shell} from '../../../core/geometry/cad/CadCommon';

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
		return 'box';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const api = new oc.BRepPrimAPI_MakeBox_2(
			this.pv.sizes.x * this.pv.size,
			this.pv.sizes.y * this.pv.size,
			this.pv.sizes.z * this.pv.size
		);
		// translate
		const tf = new oc.gp_Trsf_1();
		tf.SetTranslation_1(new oc.gp_Vec_4(this.pv.center.x, this.pv.center.y, this.pv.center.z));
		tf.SetScaleFactor(1);
		const loc = new oc.TopLoc_Location_2(tf);
		const shape = api.Shape().Moved(loc, false) as TopoDS_Shell;
		// cube.Solid();

		this.setShell(shape);
	}
}
