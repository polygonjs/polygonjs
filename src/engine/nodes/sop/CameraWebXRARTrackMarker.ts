/**
 * allows the viewer created by this camera to track markers
 *
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraWebXRARTrackMarkerSopOperation} from '../../operations/sop/CameraWebXRARTrackMarker';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraTrackMarkerParamConfig} from '../../../core/camera/webXR/CoreCameraTrackMarker';
class CameraWebXRARTrackMarkerSopParamsConfig extends CoreCameraTrackMarkerParamConfig(NodeParamsConfig) {}
const ParamsConfig = new CameraWebXRARTrackMarkerSopParamsConfig();

export class CameraWebXRARTrackMarkerSopNode extends TypedSopNode<CameraWebXRARTrackMarkerSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.WEBXR_AR_TRACK_MARKER;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraWebXRARTrackMarkerSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraWebXRARTrackMarkerSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraWebXRARTrackMarkerSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
