// /**
//  * Allows to render with a mask.
//  *
//  *
//  */
// import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
// import {MaskPass} from '../../../modules/three/examples/jsm/postprocessing/MaskPass';
// import {CameraNodeType, CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
// import {SceneObjNode} from '../obj/Scene';
// import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
// import {Scene} from 'three';
// import {Camera} from 'three';

// interface MaskPassWithContext extends MaskPass {
// 	context: {
// 		scene: Scene;
// 		camera: Camera;
// 	};
// }

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {isBooleanTrue} from '../../../core/BooleanValue';
// import {ObjType} from '../../poly/registers/nodes/types/Obj';
// class MaskPostParamsConfig extends NodeParamsConfig {
// 	/** @param overrides the scene to render */
// 	overrideScene = ParamConfig.BOOLEAN(0, PostParamOptions);
// 	/** @param scene to render the mask from */
// 	scene = ParamConfig.NODE_PATH('', {
// 		visibleIf: {overrideScene: 1},
// 		nodeSelection: {
// 			context: NodeContext.OBJ,
// 			types: [SceneObjNode.type()],
// 		},
// 		...PostParamOptions,
// 	});
// 	/** @param overrides the camera to render the mask */
// 	overrideCamera = ParamConfig.BOOLEAN(0, PostParamOptions);
// 	/** @param camera to render with */
// 	camera = ParamConfig.NODE_PATH('', {
// 		visibleIf: {overrideCamera: 1},
// 		nodeSelection: {
// 			context: NodeContext.OBJ,
// 		},
// 		...PostParamOptions,
// 	});
// 	/** @param inverse the mask */
// 	inverse = ParamConfig.BOOLEAN(0, PostParamOptions);
// }
// const ParamsConfig = new MaskPostParamsConfig();
// export class MaskPostNode extends TypedPostNode<MaskPassWithContext, MaskPostParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'mask';
// 	}

// 	protected override _createPass(context: TypedPostNodeContext) {
// 		const pass = new MaskPass(context.scene, context.camera) as MaskPassWithContext;
// 		pass.context = {
// 			scene: context.scene,
// 			camera: context.camera,
// 		};
// 		this.updatePass(pass);

// 		return pass;
// 	}
// 	override updatePass(pass: MaskPassWithContext) {
// 		pass.inverse = isBooleanTrue(this.pv.inverse);
// 		this._updateScene(pass);
// 		this._updateCamera(pass);
// 	}
// 	private async _updateScene(pass: MaskPassWithContext) {
// 		if (isBooleanTrue(this.pv.overrideScene)) {
// 			if (this.p.scene.isDirty()) {
// 				await this.p.scene.compute();
// 			}
// 			const foundNode = this.pv.scene.nodeWithContext(NodeContext.OBJ);
// 			if (!foundNode) {
// 				return;
// 			}
// 			if (foundNode.type() != ObjType.SCENE) {
// 				return;
// 			}
// 			const sceneNode = foundNode as SceneObjNode;
// 			pass.scene = sceneNode.object;
// 			return;
// 		}
// 		pass.scene = pass.context.scene;
// 	}
// 	private async _updateCamera(pass: MaskPassWithContext) {
// 		if (isBooleanTrue(this.pv.overrideCamera)) {
// 			if (this.p.camera.isDirty()) {
// 				await this.p.camera.compute();
// 			}
// 			const foundNode = this.pv.scene.nodeWithContext(NodeContext.OBJ);
// 			if (!foundNode) {
// 				return;
// 			}
// 			if (!CAMERA_TYPES.includes(foundNode.type() as CameraNodeType)) {
// 				return;
// 			}
// 			const cameraNode = foundNode as BaseCameraObjNodeType;
// 			pass.camera = cameraNode.object;
// 			return;
// 		}
// 		pass.camera = pass.context.camera;
// 	}
// }
