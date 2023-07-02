/**
 * Projects Points in relation to a camera.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraProjectSopOperation} from '../../operations/sop/CameraProject';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = CameraProjectSopOperation.DEFAULT_PARAMS;
class CameraProjectSopParamsConfig extends NodeParamsConfig {
	/** @param unproject */
	project = ParamConfig.BOOLEAN(DEFAULT.project);
}
const ParamsConfig = new CameraProjectSopParamsConfig();

export class CameraProjectSopNode extends TypedSopNode<CameraProjectSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAMERA_PROJECT;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState(CameraProjectSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraProjectSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new CameraProjectSopOperation(this._scene, this.states);
		const coreGroup = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
