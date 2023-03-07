/**
 * Center the CSG input geometry
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import type {maths} from '@jscad/modeling';
import {transforms} from '@jscad/modeling';
const {center} = transforms;

class CSGCenterSopParamsConfig extends NodeParamsConfig {
	/** @param x */
	x = ParamConfig.BOOLEAN(1);
	/** @param y */
	y = ParamConfig.BOOLEAN(1);
	/** @param z */
	z = ParamConfig.BOOLEAN(1);
	/** @param relativeTo */
	relativeTo = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CSGCenterSopParamsConfig();

export class CSGCenterSopNode extends CSGSopNode<CSGCenterSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_CENTER;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _relativeTo: maths.vec3.Vec3 = [0, 0, 0];
	private _axes: [boolean, boolean, boolean] = [true, true, true];
	override cook(inputCoreGroups: CoreGroup[]) {
		vector3ToCsgVec3(this.pv.relativeTo, this._relativeTo);
		this._axes[0] = this.pv.x;
		this._axes[1] = this.pv.y;
		this._axes[2] = this.pv.z;
		const options: transforms.CenterOptions = {
			axes: this._axes,
			relativeTo: this._relativeTo,
		};
		const inputObjects = inputCoreGroups[0].csgObjects();
		if (inputObjects) {
			const newObjects = inputObjects.map((o) => center(options, o.csgGeometry()));
			this.setCSGGeometries(newObjects);
		} else {
			this.setCSGObjects([]);
		}
	}
}
