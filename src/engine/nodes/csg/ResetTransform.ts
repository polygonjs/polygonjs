/**
 * resets the geometry transform matrix
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {csgApplyTransform} from '../../../core/geometry/csg/math/CsgMat4';
const {mat4} = jscad.maths;

class ResetTransformCsgParamsConfig extends NodeParamsConfig {
	/** @param bake matrix onto points */
	extract = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new ResetTransformCsgParamsConfig();

export class ResetTransformCsgNode extends TypedCsgNode<ResetTransformCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'resetTransform';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const objects = inputCoreGroups[0].objects();

		for (let object of objects) {
			if (this.pv.extract) {
				csgApplyTransform(object);
			} else {
				mat4.identity(object.transforms);
			}
		}

		this.setCsgCoreObjects(objects);
	}
}
