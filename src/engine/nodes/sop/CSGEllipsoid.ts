/**
 * Creates a CSG ellipsoid.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
const {ellipsoid} = primitives;

class CSGEllipsoidSopParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param radius */
	radius = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param segments */
	segments = ParamConfig.INTEGER(32, {
		range: [4, 128],
		rangeLocked: [true, false],
	});
	/** @param axes */
	// axes = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new CSGEllipsoidSopParamsConfig();

export class CSGEllipsoidSopNode extends CSGSopNode<CSGEllipsoidSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_ELLIPSOID;
	}

	private _center: maths.vec3.Vec3 = [0, 0, 0];
	private _radius: maths.vec3.Vec3 = [0, 0, 0];
	// private _axes: maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		vector3ToCsgVec3(this.pv.center, this._center);
		vector3ToCsgVec3(this.pv.radius, this._radius);
		// vector3ToCsgVec3(this.pv.axes, this._axes);
		const geo = ellipsoid({
			center: this._center,
			radius: this._radius,
			segments: this.pv.segments,
			// axes: this._axes,
		});

		this.setCSGGeometry(geo);
	}
}
