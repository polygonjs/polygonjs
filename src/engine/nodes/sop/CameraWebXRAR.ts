/**
 * allows the viewer created by this camera to be accessible in WebXR for AR (augmented reality)
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraWebXRARSopOperation} from '../../operations/sop/CameraWebXRAR';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {CoreCameraWebXRARParamConfig} from '../../../core/camera/webXR/CoreCameraWebXRAR';
import {Constructor} from '../../../types/GlobalTypes';
const DEFAULT = CameraWebXRARSopOperation.DEFAULT_PARAMS;

export function ParamsConfigBase<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param group to assign the material to */
		group = ParamConfig.STRING(DEFAULT.group, {
			objectMask: true,
		});
		/** @param sets if this node should search through the materials inside the whole hierarchy */
		applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});
	};
}

class CameraWebXRARSopParamsConfig extends CoreCameraWebXRARParamConfig(ParamsConfigBase(NodeParamsConfig)) {}
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
