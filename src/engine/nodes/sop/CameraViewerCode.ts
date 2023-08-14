/**
 * extends the HTML of the viewer created by the input camera
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraViewerCodeSopOperation} from '../../operations/sop/CameraViewerCode';
import {HierarchyParamConfigAll} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraViewerCodeParamConfig} from '../../../core/camera/CoreCameraViewerCodeController';
class CameraViewerCodeSopParamsConfig extends CoreCameraViewerCodeParamConfig(HierarchyParamConfigAll) {}
const ParamsConfig = new CameraViewerCodeSopParamsConfig();

export class CameraViewerCodeSopNode extends TypedSopNode<CameraViewerCodeSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.VIEWER_CODE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraViewerCodeSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraViewerCodeSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraViewerCodeSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
