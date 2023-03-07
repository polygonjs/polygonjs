/**
 * Projects a 3D shape onto a plane and outputs a curve out of the resulting shape
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CsgGeometry, csgIsGeom3} from '../../../core/geometry/csg/CsgCommon';
import {extrusions} from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import type {maths} from '@jscad/modeling';
const {project} = extrusions;

class CSGProjectSopParamsConfig extends NodeParamsConfig {
	/** @param axis */
	axis = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param origin */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CSGProjectSopParamsConfig();

export class CSGProjectSopNode extends CSGSopNode<CSGProjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_PROJECT;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _axis: maths.vec3.Vec3 = [0, 0, 0];
	private _origin: maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();
		if (inputObjects && inputObjects.length != 0) {
			vector3ToCsgVec3(this.pv.axis, this._axis);
			vector3ToCsgVec3(this.pv.origin, this._origin);
			const options: extrusions.ProjectOptions = {
				axis: this._axis,
				origin: this._origin,
			};
			const newGeometries: CsgGeometry[] = [];
			for (let inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				if (csgIsGeom3(inputGeometry)) {
					newGeometries.push(project(options, inputGeometry));
				} else {
					newGeometries.push(inputGeometry);
				}
			}
			this.setCSGGeometries(newGeometries);
		} else {
			this.setCSGObjects([]);
		}
	}
}
