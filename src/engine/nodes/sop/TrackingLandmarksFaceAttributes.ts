/**
 * Creates attributes used to adjust face tracking resolution
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {
	CoreComputerVisionFace,
	CoreComputerVisionFaceParamConfig,
} from '../../../core/computerVision/face/CoreComputerVisionFace';

class TrackingLandmarksFaceAttributesSopParamsConfig extends CoreComputerVisionFaceParamConfig(NodeParamsConfig) {}
const ParamsConfig = new TrackingLandmarksFaceAttributesSopParamsConfig();

export class TrackingLandmarksFaceAttributesSopNode extends TypedSopNode<TrackingLandmarksFaceAttributesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'trackingLandmarksFaceAttributes';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const objects = inputCoreGroup.objects();
		for (const object of objects) {
			CoreComputerVisionFace.setAttributes(object, this.pv);
		}

		this.setCoreGroup(inputCoreGroup);
	}
}
