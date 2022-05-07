/**
 * Mirror the input geometry
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
const {mirror} = jscad.transforms;

class MirrorCsgParamsConfig extends NodeParamsConfig {
	/** @param origin */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param normal */
	normal = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new MirrorCsgParamsConfig();

export class MirrorCsgNode extends TypedCsgNode<MirrorCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'mirror';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _origin: jscad.maths.vec3.Vec3 = [0, 0, 0];
	private _normal: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.origin, this._origin);
		vector3ToCsgVec3(this.pv.normal, this._normal);
		const options: jscad.transforms.MirrorOptions = {
			origin: this._origin,
			normal: this._normal,
		};
		const objects = inputCoreGroups[0].objects().map((o) => {
			const geo = mirror(options, o);
			if (jscad.geometries.geom3.isA(geo)) {
				return jscad.geometries.geom3.invert(geo);
			} else {
				return geo;
			}
		});
		this.setCsgCoreObjects(objects);
	}
}
