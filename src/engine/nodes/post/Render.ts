import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {RenderPass} from '../../../modules/three/examples/jsm/postprocessing/RenderPass';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType, NodeContext} from '../../poly/NodeContext';
import {SceneObjNode} from '../obj/Scene';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {PerspectiveCameraObjNode} from '../obj/PerspectiveCamera';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface RenderPassWithContext extends RenderPass {
	context: {
		camera: Camera;
		scene: Scene;
	};
}
class RenderPostParamsConfig extends NodeParamsConfig {
	overrideScene = ParamConfig.BOOLEAN(0, PostParamOptions);
	scene = ParamConfig.OPERATOR_PATH('/scene1', {
		visibleIf: {overrideScene: 1},
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [SceneObjNode.type()],
		},
		...PostParamOptions,
	});
	overrideCamera = ParamConfig.BOOLEAN(0, PostParamOptions);
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		visibleIf: {overrideCamera: 1},
		nodeSelection: {
			context: NodeContext.OBJ,
		},
		...PostParamOptions,
	});
	// clear_color = ParamConfig.COLOR([0, 0, 0]);
	// clear_alpha = ParamConfig.FLOAT(0);
	// clear_depth = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new RenderPostParamsConfig();
export class RenderPostNode extends TypedPostProcessNode<RenderPass, RenderPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'render';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new RenderPass(context.scene, context.camera) as RenderPassWithContext;

		pass.context = {
			camera: context.camera,
			scene: context.scene,
		};
		this.updatePass(pass);
		return pass;
	}

	updatePass(pass: RenderPassWithContext) {
		this._updateCamera(pass);
		this._update_scene(pass);
	}

	private async _updateCamera(pass: RenderPassWithContext) {
		if (isBooleanTrue(this.pv.overrideCamera)) {
			if (this.p.camera.isDirty()) {
				await this.p.camera.compute();
			}
			const obj_node = this.p.camera.found_node_with_context(NodeContext.OBJ);
			if (obj_node) {
				if (obj_node.type() == CameraNodeType.PERSPECTIVE || obj_node.type() == CameraNodeType.ORTHOGRAPHIC) {
					const camera = (obj_node as PerspectiveCameraObjNode).object;
					pass.camera = camera;
				}
			}
		} else {
			pass.camera = pass.context.camera;
		}
	}

	private async _update_scene(pass: RenderPassWithContext) {
		if (isBooleanTrue(this.pv.overrideScene)) {
			if (this.p.camera.isDirty()) {
				await this.p.scene.compute();
			}
			const obj_node = this.p.scene.found_node_with_context(NodeContext.OBJ);
			if (obj_node) {
				if (obj_node.type() == SceneObjNode.type()) {
					const scene = (obj_node as SceneObjNode).object;
					pass.scene = scene;
				}
			}
		} else {
			pass.scene = pass.context.scene;
		}
	}
}
