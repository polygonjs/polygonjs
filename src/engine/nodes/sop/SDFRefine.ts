/**
 * Refines an SDF.
 *
 *
 */

import {SDFSopNode} from './_BaseSDF';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/sdf/SDFConstant';
import {CoreGroup} from '../../../core/geometry/Group';
import {SDFObject} from '../../../core/geometry/sdf/SDFObject';

class SDFRefineSopParamsConfig extends NodeParamsConfig {
	/** @param steps */
	steps = ParamConfig.INTEGER(2, {
		range: [1, 4],
		rangeLocked: [true, false],
		step,
	});
}
const ParamsConfig = new SDFRefineSopParamsConfig();

export class SDFRefineSopNode extends SDFSopNode<SDFRefineSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SDF_REFINE;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}
	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const newObjects: SDFObject[] = [];
		const inputObjects = coreGroup.SDFObjects();
		if (inputObjects) {
			const steps = this.pv.steps;
			for (let object of inputObjects) {
				const refined = object.SDFGeometry().refine(steps);
				const newObject = new SDFObject(refined);
				newObjects.push(newObject);
			}
		}

		this.setSDFObjects(newObjects);
	}
}
