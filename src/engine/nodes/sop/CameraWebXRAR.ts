/**
 * allows the viewer created by this camera to be accessible in WebXR for AR (augmented reality)
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraWebXRARSopOperation} from '../../operations/sop/CameraWebXRAR';
import {HierarchyParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraWebXRARParamConfig} from '../../../core/camera/webXR/CoreCameraWebXRAR';

class CameraWebXRARSopParamsConfig extends CoreCameraWebXRARParamConfig(HierarchyParamConfig) {}
const ParamsConfig = new CameraWebXRARSopParamsConfig();

export class CameraWebXRARSopNode extends TypedSopNode<CameraWebXRARSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.WEBXR_AR;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraWebXRARSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraWebXRARSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraWebXRARSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
