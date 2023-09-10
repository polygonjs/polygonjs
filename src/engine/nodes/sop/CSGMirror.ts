/**
 * Mirror the input CSG geometry
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {isBooleanTrue} from '../../../core/Type';
import {CsgGeometry} from '../../../core/geometry/modules/csg/CsgCommon';
import {csgIsGeom3} from '../../../core/geometry/modules/csg/CsgCoreType';
import {vector3ToCsgVec3} from '../../../core/geometry/modules/csg/CsgVecToVector';
import {transforms, geometries} from '@jscad/modeling';
import type {maths} from '@jscad/modeling';
import {csgApplyTransform} from '../../../core/geometry/modules/csg/math/CsgMat4';
const {mirror} = transforms;

class CSGMirrorSopParamsConfig extends NodeParamsConfig {
	/** @param origin */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param normal */
	normal = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param invert */
	invert = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CSGMirrorSopParamsConfig();

export class CSGMirrorSopNode extends CSGSopNode<CSGMirrorSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_MIRROR;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _origin: maths.vec3.Vec3 = [0, 0, 0];
	private _normal: maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();
		if (inputObjects && inputObjects.length != 0) {
			vector3ToCsgVec3(this.pv.origin, this._origin);
			vector3ToCsgVec3(this.pv.normal, this._normal);
			const options: transforms.MirrorOptions = {
				origin: this._origin,
				normal: this._normal,
			};
			const newGeometries: CsgGeometry[] = [];
			for (let inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				let newGeometry = mirror(options, inputGeometry);
				csgApplyTransform(newGeometry);
				if (csgIsGeom3(newGeometry)) {
					if (isBooleanTrue(this.pv.invert)) {
						const invertedGeometry = geometries.geom3.invert(newGeometry);
						newGeometry = invertedGeometry;
					}
				}
				newGeometries.push(newGeometry);
			}
			this.setCSGGeometries(newGeometries);
		} else {
			this.setCSGObjects([]);
		}
	}
}
