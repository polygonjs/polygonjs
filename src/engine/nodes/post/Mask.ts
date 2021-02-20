/**
 * Allows to render with a mask.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {MaskPass} from '../../../modules/three/examples/jsm/postprocessing/MaskPass';
import {NodeContext} from '../../poly/NodeContext';
import {SceneObjNode} from '../obj/Scene';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';

interface MaskPassWithContext extends MaskPass {
	context: {
		scene: Scene;
		camera: Camera;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class MaskPostParamsConfig extends NodeParamsConfig {
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
	inverse = ParamConfig.BOOLEAN(0, PostParamOptions);
}
const ParamsConfig = new MaskPostParamsConfig();
export class MaskPostNode extends TypedPostProcessNode<MaskPassWithContext, MaskPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mask';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new MaskPass(context.scene, context.camera) as MaskPassWithContext;
		pass.context = {
			scene: context.scene,
			camera: context.camera,
		};
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: MaskPassWithContext) {
		pass.inverse = isBooleanTrue(this.pv.inverse);
		this._update_scene(pass);
		this._update_camera(pass);
	}
	private async _update_scene(pass: MaskPassWithContext) {
		if (isBooleanTrue(this.pv.overrideScene)) {
			if (this.p.scene.isDirty()) {
				await this.p.scene.compute();
			}
			const scene_node = this.p.scene.found_node_with_expected_type() as SceneObjNode;
			if (scene_node) {
				pass.scene = scene_node.object;
				return;
			}
		}
		pass.scene = pass.context.scene;
	}
	private async _update_camera(pass: MaskPassWithContext) {
		if (isBooleanTrue(this.pv.overrideCamera)) {
			if (this.p.camera.isDirty()) {
				await this.p.camera.compute();
			}
			const camera_node = this.p.camera.found_node_with_expected_type() as BaseCameraObjNodeType;
			if (camera_node) {
				pass.camera = camera_node.object;
				return;
			}
		}
		pass.camera = pass.context.camera;
	}
}
