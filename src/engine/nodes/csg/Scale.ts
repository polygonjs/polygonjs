/**
 * Scale the input geometry
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {csgVec3MultScalar} from '../../../core/geometry/csg/math/CsgMathVec3';
const {scale} = jscad.transforms;

class ScaleCsgParamsConfig extends NodeParamsConfig {
	/** @param scale */
	s = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param scale (as a float) */
	scale = ParamConfig.FLOAT(1, {range: [0, 10]});
}
const ParamsConfig = new ScaleCsgParamsConfig();

export class ScaleCsgNode extends TypedCsgNode<ScaleCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'scale';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _s: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.s, this._s);
		csgVec3MultScalar(this._s, this.pv.scale);
		const objects = inputCoreGroups[0].objects().map((o) => scale(this._s, o));
		this.setCsgCoreObjects(objects);
	}
}
