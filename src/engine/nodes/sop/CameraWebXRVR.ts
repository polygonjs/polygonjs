/**
 * allows the viewer created by this camera to be accessible in WebXR for VR (virtual reality)
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraWebXRVRSopOperation} from '../../operations/sop/CameraWebXRVR';
import {HierarchyParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraWebXRVRParamConfig} from '../../../core/camera/webXR/CoreCameraWebXRVR';

class CameraWebXRVRSopParamsConfig extends CoreCameraWebXRVRParamConfig(HierarchyParamConfig) {}
const ParamsConfig = new CameraWebXRVRSopParamsConfig();

export class CameraWebXRVRSopNode extends TypedSopNode<CameraWebXRVRSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.WEBXR_VR;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraWebXRVRSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraWebXRVRSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraWebXRVRSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
