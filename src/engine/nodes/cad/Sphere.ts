/**
 * Creates a sphere.
 *
 *
 */
import {TypedCadNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {primitives, maths} from '@jscad/modeling';
// import {vector3ToCsgVec3} from '../../../core/geometry/cad/CsgVecToVector';
// import {csgVec3MultScalar} from '../../../core/geometry/cad/math/CsgMathVec3';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
// import {CoreMath} from '../../../core/math/_Module';
// const {cuboid, roundedCuboid} = primitives;
import {CadLoader} from '../../../core/geometry/cad/CadLoader';
// import {BitByBitOCCT, OccStateEnum} from 'bitbybit-occt-worker';
// import * as Inputs from 'bitbybit-occt/lib/api/inputs/inputs';

class SphereCadParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step,
	});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SphereCadParamsConfig();

export class SphereCadNode extends TypedCadNode<SphereCadParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sphere';
	}

	override async cook(inputCoreGroups: CadCoreGroup[]) {
		const oc = await CadLoader.core();
		const api = new oc.BRepPrimAPI_MakeSphere_1(this.pv.radius);

		const tf = new oc.gp_Trsf_1();
		tf.SetTranslation_1(new oc.gp_Vec_4(this.pv.center.x, this.pv.center.y, this.pv.center.z));
		tf.SetScaleFactor(1);
		const loc = new oc.TopLoc_Location_2(tf);
		const shape = api.Shape().Moved(loc, false);

		this.setShell(shape);
	}
}
