/**
 * Creates attributes used to adjust hand tracking resolution
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {
	CoreComputerVisionHand,
	CoreComputerVisionHandParamConfig,
} from '../../../core/computerVision/hand/CoreComputerVisionHand';

class TrackingLandmarksHandAttributesSopParamsConfig extends CoreComputerVisionHandParamConfig(NodeParamsConfig) {}
const ParamsConfig = new TrackingLandmarksHandAttributesSopParamsConfig();

export class TrackingLandmarksHandAttributesSopNode extends TypedSopNode<TrackingLandmarksHandAttributesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'trackingLandmarksHandAttributes';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const objects = inputCoreGroup.objects();
		for (const object of objects) {
			CoreComputerVisionHand.setAttributes(object, this.pv);
		}

		this.setCoreGroup(inputCoreGroup);
	}
}
