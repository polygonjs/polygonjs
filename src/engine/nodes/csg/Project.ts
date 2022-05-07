/**
 * Extrude the geometry and rotates it
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
const {project} = jscad.extrusions;

class ProjectCsgParamsConfig extends NodeParamsConfig {
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param origin */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new ProjectCsgParamsConfig();

export class ProjectCsgNode extends TypedCsgNode<ProjectCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'project';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _axis: jscad.maths.vec3.Vec3 = [0, 0, 0];
	private _origin: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.axis, this._axis);
		vector3ToCsgVec3(this.pv.origin, this._origin);
		const options: jscad.extrusions.ProjectOptions = {
			axis: this._axis,
			origin: this._origin,
		};
		const objects = inputCoreGroups[0]
			.objects()
			.map((o) => {
				if (jscad.geometries.geom3.isA(o)) {
					return project(options, o);
				} else {
					return o;
				}
			})
			.flat();
		this.setCsgCoreObjects(objects);
	}
}
