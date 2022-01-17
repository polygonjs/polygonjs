/**
 * Projects Points in relation to a camera.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraProjectSopOperation} from '../../operations/sop/CameraProject';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext, CAMERA_TYPES} from '../../poly/NodeContext';
const DEFAULT = CameraProjectSopOperation.DEFAULT_PARAMS;
class CameraProjectSopParamsConfig extends NodeParamsConfig {
	/** @param cameara */
	camera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: CAMERA_TYPES,
		},
	});
	/** @param unproject */
	unproject = ParamConfig.BOOLEAN(DEFAULT.unproject);
}
const ParamsConfig = new CameraProjectSopParamsConfig();

export class CameraProjectSopNode extends TypedSopNode<CameraProjectSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'cameraProject';
	}

	static displayedInputNames(): string[] {
		return ['points to project/unproject'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraProjectSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraProjectSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new CameraProjectSopOperation(this._scene, this.states);
		const coreGroup = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
