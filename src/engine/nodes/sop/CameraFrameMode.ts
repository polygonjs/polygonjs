/**
 * sets the controls used by the camera
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraFrameModeSopOperation} from '../../operations/sop/CameraFrameMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraFrameParamConfig} from '../../../core/camera/CoreCameraFrameMode';
const DEFAULT = CameraFrameModeSopOperation.DEFAULT_PARAMS;
class CameraFrameModeSopParamsConfig extends CoreCameraFrameParamConfig(NodeParamsConfig) {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param sets if this node should search through the materials inside the whole hierarchy */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});
}
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
		const core_group = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(core_group);
	}
}
