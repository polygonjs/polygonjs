/**
 * Creates a sphere.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {Matrix4} from 'three';
import {csgApplyMatrix4} from '../../../core/geometry/csg/math/CsgMat4';
const {sphere, geodesicSphere} = jscad.primitives;

class SphereCsgParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param geodesic */
	geodesic = ParamConfig.BOOLEAN(0);
	/** @param segments */
	segments = ParamConfig.INTEGER(16, {
		range: [4, 128],
		rangeLocked: [true, false],
		visibleIf: {geodesic: 0},
	});
	/** @param frequency */
	frequency = ParamConfig.INTEGER(4, {
		range: [1, 32],
		rangeLocked: [true, false],
		visibleIf: {geodesic: 1},
	});
	/** @param axes */
	// axes = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new SphereCsgParamsConfig();

export class SphereCsgNode extends TypedCsgNode<SphereCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sphere';
	}

	private _center: jscad.maths.vec3.Vec3 = [0, 0, 0];
	private _matrix4 = new Matrix4();
	// private _axes: jscad.maths.vec3.Vec3 = [0, 1, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.center, this._center);
		// vector3ToCsgVec3(this.pv.axes, this._axes);
		const geo = this.pv.geodesic ? this._createGeodesicSphere() : this._createSphere();
		this.setCsgCoreObject(geo);
	}
	private _createSphere() {
		return sphere({
			center: this._center,
			radius: this.pv.radius,
			segments: this.pv.segments,
			// axes: this._axes,
		});
	}
	private _createGeodesicSphere() {
		const geo = geodesicSphere({
			radius: this.pv.radius,
			frequency: this.pv.frequency * 6, // mult by 6 here to make it more intuitive
		});
		if (this.pv.center.length() > 0) {
			this._matrix4.identity();
			this._matrix4.makeTranslation(this.pv.center.x, this.pv.center.y, this.pv.center.z);
			csgApplyMatrix4(geo, this._matrix4);
		}
		return geo;
	}
}
