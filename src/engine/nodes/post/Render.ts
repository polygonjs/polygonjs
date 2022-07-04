import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {RenderPass} from 'postprocessing';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
import {SceneObjNode} from '../obj/Scene';
import {Scene} from 'three';
import {Camera} from 'three';
import {PerspectiveCameraObjNode} from '../obj/PerspectiveCamera';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface RenderPassContext {
	camera: Camera;
	scene: Scene;
}
class RenderPassWithContext extends RenderPass {
	public context: RenderPassContext;
	constructor(public override scene: Scene, public override camera: Camera) {
		super(scene, camera);
		this.context = {scene, camera};
	}
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'render';
	}

	override createPass(context: TypedPostNodeContext) {
		const pass = new RenderPass(context.scene, context.camera) as RenderPassWithContext;

		pass.context = {
			camera: context.camera,
			scene: context.scene,
		};
		this.updatePass(pass);
		return pass;
	}

	override updatePass(pass: RenderPassWithContext) {
		this._updateCamera(pass);
		this._updateScene(pass);
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

	private async _updateScene(pass: RenderPassWithContext) {
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
