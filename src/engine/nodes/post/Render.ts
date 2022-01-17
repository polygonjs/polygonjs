import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {RenderPass} from '../../../modules/three/examples/jsm/postprocessing/RenderPass';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
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
	/** @param overrideScene */
	overrideScene = ParamConfig.BOOLEAN(0, PostParamOptions);
	/** @param scene */
	scene = ParamConfig.NODE_PATH('', {
		visibleIf: {overrideScene: 1},
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [SceneObjNode.type()],
		},
		...PostParamOptions,
	});
	/** @param overrideCamera */
	overrideCamera = ParamConfig.BOOLEAN(0, PostParamOptions);
	/** @param camera */
	camera = ParamConfig.NODE_PATH('', {
		visibleIf: {overrideCamera: 1},
		nodeSelection: {
			context: NodeContext.OBJ,
			types: CAMERA_TYPES,
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
			const objNode = this.pv.camera.nodeWithContext(NodeContext.OBJ);
			if (objNode) {
				if ((CAMERA_TYPES as string[]).includes(objNode.type())) {
					const camera = (objNode as PerspectiveCameraObjNode).object;
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
			const objNode = this.pv.scene.nodeWithContext(NodeContext.OBJ);
			if (objNode) {
				if (objNode.type() == SceneObjNode.type()) {
					const scene = (objNode as SceneObjNode).object;
					pass.scene = scene;
				}
			}
		} else {
			pass.scene = pass.context.scene;
		}
	}
}
