/**
 * sets the FPS (frame per second) that the viewer created by this camera should use
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraFPSSopOperation} from '../../operations/sop/CameraFPS';
import {HierarchyParamConfigAll} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraFPSParamConfig} from '../../../core/camera/CoreCameraFPS';
class CameraFPSSopParamsConfig extends CoreCameraFPSParamConfig(HierarchyParamConfigAll) {}
const ParamsConfig = new CameraFPSSopParamsConfig();

export class CameraFPSSopNode extends TypedSopNode<CameraFPSSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.FPS;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraFPSSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraFPSSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraFPSSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
