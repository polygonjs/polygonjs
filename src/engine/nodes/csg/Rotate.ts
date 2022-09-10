/**
 * Rotate the input geometry
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {MathUtils} from 'three';
const {rotate} = jscad.transforms;
const {degToRad} = MathUtils;

class RotateCsgParamsConfig extends NodeParamsConfig {
	/** @param rotate */
	r = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new RotateCsgParamsConfig();

export class RotateCsgNode extends TypedCsgNode<RotateCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rotate';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _r: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.r, this._r);
		this._r[0] = degToRad(this._r[0]);
		this._r[1] = degToRad(this._r[1]);
		this._r[2] = degToRad(this._r[2]);
		const objects = inputCoreGroups[0].objects().map((o) => rotate(this._r, o));
		this.setCsgCoreObjects(objects);
	}
}
