/**
 * sets the scene that this camera will render
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraRenderSceneSopOperation} from '../../operations/sop/CameraRenderScene';
import {HierarchyParamConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraSopNodeType, NodeContext} from '../../poly/NodeContext';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
class CameraRenderSceneSopParamsConfig extends HierarchyParamConfig {
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
