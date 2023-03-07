/**
 * resets the CSG geometry transform matrix
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {maths} from '@jscad/modeling';
import {csgApplyTransform} from '../../../core/geometry/csg/math/CsgMat4';
const {mat4} = maths;

class CSGTransformResetSopParamsConfig extends NodeParamsConfig {
	/** @param bake matrix onto points */
	extract = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new CSGTransformResetSopParamsConfig();

export class CSGTransformResetSopNode extends CSGSopNode<CSGTransformResetSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_TRANSFORM_RESET;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const objects = inputCoreGroups[0].csgObjects();

		if (objects) {
			for (let object of objects) {
				if (this.pv.extract) {
					csgApplyTransform(object.csgGeometry());
				} else {
					mat4.identity(object.csgGeometry().transforms);
				}
			}

			this.setCSGObjects(objects);
		} else {
			this.setCSGObjects([]);
		}
	}
}
