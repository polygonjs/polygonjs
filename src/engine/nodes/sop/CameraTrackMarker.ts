/**
 * allows the viewer created by this camera to be accessible in WebXR for AR (augmented reality)
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraTrackMarkerSopOperation} from '../../operations/sop/CameraTrackMarker';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraTrackMarkerParamConfig} from '../../../core/camera/CoreCameraTrackMarker';
class CameraTrackMarkerSopParamsConfig extends CoreCameraTrackMarkerParamConfig(NodeParamsConfig) {}
const ParamsConfig = new CameraTrackMarkerSopParamsConfig();

export class CameraTrackMarkerSopNode extends TypedSopNode<CameraTrackMarkerSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.TRACK_MARKER;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraTrackMarkerSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraTrackMarkerSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraTrackMarkerSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
