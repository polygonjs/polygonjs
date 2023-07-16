/**
 * sets the controls used by the camera
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraFrameModeSopOperation} from '../../operations/sop/CameraFrameMode';
import {HierarchyParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraFrameParamConfig} from '../../../core/camera/CoreCameraFrameMode';
class CameraFrameModeSopParamsConfig extends CoreCameraFrameParamConfig(HierarchyParamConfig) {}
const ParamsConfig = new CameraFrameModeSopParamsConfig();

export class CameraFrameModeSopNode extends TypedSopNode<CameraFrameModeSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.FRAME_MODE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraFrameModeSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraFrameModeSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraFrameModeSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
