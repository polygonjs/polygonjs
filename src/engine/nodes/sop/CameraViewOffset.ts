/**
 * offsets the camera view
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraViewOffsetSopOperation} from '../../operations/sop/CameraViewOffset';
import {HierarchyParamConfigAll} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraViewOffsetParamConfig} from '../../../core/camera/CoreCameraViewOffset';
class CameraViewOffsetSopParamsConfig extends CoreCameraViewOffsetParamConfig(HierarchyParamConfigAll) {}
const ParamsConfig = new CameraViewOffsetSopParamsConfig();

export class CameraViewOffsetSopNode extends TypedSopNode<CameraViewOffsetSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.VIEW_OFFSET;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraViewOffsetSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraViewOffsetSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraViewOffsetSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
