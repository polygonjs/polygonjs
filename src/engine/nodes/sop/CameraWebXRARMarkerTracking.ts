/**
 * allows the viewer created by this camera to track markers
 *
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraWebXRARMarkerTrackingSopOperation} from '../../operations/sop/CameraWebXRARMarkerTracking';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraMarkerTrackingParamConfig} from '../../../core/camera/webXR/CoreCameraMarkerTracking';
class CameraWebXRARMarkerTrackingSopParamsConfig extends CoreCameraMarkerTrackingParamConfig(NodeParamsConfig) {}
const ParamsConfig = new CameraWebXRARMarkerTrackingSopParamsConfig();

export class CameraWebXRARMarkerTrackingSopNode extends TypedSopNode<CameraWebXRARMarkerTrackingSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.WEBXR_AR_MARKER_TRACKING;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraWebXRARMarkerTrackingSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraWebXRARMarkerTrackingSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation =
			this._operation || new CameraWebXRARMarkerTrackingSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
