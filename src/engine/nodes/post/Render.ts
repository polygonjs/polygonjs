import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {RenderPass} from '../../../../modules/three/examples/jsm/postprocessing/RenderPass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {SceneObjNode} from '../obj/Scene';
class RenderPostParamsConfig extends NodeParamsConfig {
	override_scene = ParamConfig.BOOLEAN(0);
	scene = ParamConfig.OPERATOR_PATH('/scene1', {
		visible_if: {override_scene: 1},
		node_selection: {
			context: NodeContext.OBJ,
			type: SceneObjNode.type(),
		},
	});
	override_camera = ParamConfig.BOOLEAN(0);
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		visible_if: {override_camera: 1},
		node_selection: {
			context: NodeContext.OBJ,
		},
	});
}
const ParamsConfig = new RenderPostParamsConfig();
export class RenderPostNode extends TypedPostProcessNode<RenderPass, RenderPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'render';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new RenderPass(context.scene, context.camera);
		return pass;
	}
}
