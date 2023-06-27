/**
 * sets the scene that this camera will render
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraRenderSceneSopOperation} from '../../operations/sop/CameraRenderScene';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType, NodeContext} from '../../poly/NodeContext';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
const DEFAULT = CameraRenderSceneSopOperation.DEFAULT_PARAMS;
class CameraRenderSceneSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param sets if this node should search through the materials inside the whole hierarchy */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});
	/** @param renderer */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [ObjType.SCENE],
		},
		dependentOnFoundNode: true,
	});
}
const ParamsConfig = new CameraRenderSceneSopParamsConfig();

export class CameraRenderSceneSopNode extends TypedSopNode<CameraRenderSceneSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return CameraSopNodeType.RENDER_SCENE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(CameraRenderSceneSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CameraRenderSceneSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CameraRenderSceneSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(core_group);
	}
}
