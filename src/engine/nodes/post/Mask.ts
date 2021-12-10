/**
 * Allows to render with a mask.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {MaskPass} from '../../../modules/three/examples/jsm/postprocessing/MaskPass';
import {CameraNodeType, CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
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
import {ObjType} from '../../poly/registers/nodes/types/Obj';
class MaskPostParamsConfig extends NodeParamsConfig {
	overrideScene = ParamConfig.BOOLEAN(0, PostParamOptions);
	scene = ParamConfig.NODE_PATH('', {
		visibleIf: {overrideScene: 1},
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [SceneObjNode.type()],
		},
		...PostParamOptions,
	});
	overrideCamera = ParamConfig.BOOLEAN(0, PostParamOptions);
	camera = ParamConfig.NODE_PATH('', {
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
	paramsConfig = ParamsConfig;
	static type() {
		return 'mask';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new MaskPass(context.scene, context.camera) as MaskPassWithContext;
		pass.context = {
			scene: context.scene,
			camera: context.camera,
		};
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: MaskPassWithContext) {
		pass.inverse = isBooleanTrue(this.pv.inverse);
		this._updateScene(pass);
		this._updateCamera(pass);
	}
	private async _updateScene(pass: MaskPassWithContext) {
		if (isBooleanTrue(this.pv.overrideScene)) {
			if (this.p.scene.isDirty()) {
				await this.p.scene.compute();
			}
			const foundNode = this.pv.scene.nodeWithContext(NodeContext.OBJ);
			if (!foundNode) {
				return;
			}
			if (foundNode.type() != ObjType.SCENE) {
				return;
			}
			const sceneNode = foundNode as SceneObjNode;
			pass.scene = sceneNode.object;
			return;
		}
		pass.scene = pass.context.scene;
	}
	private async _updateCamera(pass: MaskPassWithContext) {
		if (isBooleanTrue(this.pv.overrideCamera)) {
			if (this.p.camera.isDirty()) {
				await this.p.camera.compute();
			}
			const foundNode = this.pv.scene.nodeWithContext(NodeContext.OBJ);
			if (!foundNode) {
				return;
			}
			if (!CAMERA_TYPES.includes(foundNode.type() as CameraNodeType)) {
				return;
			}
			const cameraNode = foundNode as BaseCameraObjNodeType;
			pass.camera = cameraNode.object;
			return;
		}
		pass.camera = pass.context.camera;
	}
}
