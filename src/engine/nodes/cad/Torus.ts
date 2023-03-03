/**
 * Creates a torus.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
import {cadAxis} from '../../../core/geometry/cad/CadMath';
import {CadType} from '../../poly/registers/nodes/types/Cad';
import {cadShapeTranslate} from '../../../core/geometry/cad/toObject3D/CadShapeCommon';

class TorusCadParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new TorusCadParamsConfig();

export class TorusCadNode extends TypedCadNode<TorusCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CadType.TORUS;
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const axis = cadAxis(this.pv.axis);
		const api = this.pv.closed
			? new oc.BRepPrimAPI_MakeTorus_5(axis, this.pv.outerRadius, this.pv.innerRadius)
			: new oc.BRepPrimAPI_MakeTorus_6(axis, this.pv.outerRadius, this.pv.innerRadius, this.pv.phi);

		const shape = cadShapeTranslate(api.Shape(), this.pv.center);

		this.setShell(shape);
	}
}
