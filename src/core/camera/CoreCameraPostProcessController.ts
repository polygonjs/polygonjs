import {Camera, Scene, WebGLRenderer} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import type {BaseNetworkPostProcessNodeType} from '../../engine/nodes/post/utils/EffectComposerController';
import {BaseNodeType, TypedNode} from '../../engine/nodes/_Base';
import {CameraSopNodeType, NetworkNodeType, NodeContext} from '../../engine/poly/NodeContext';
import {CoreObject} from '../geometry/modules/three/CoreObject';
import {CoreType} from '../Type';
import {CameraAttribute} from './CoreCamera';
import {BaseViewerType} from '../../engine/viewers/_Base';
import {AbstractRenderer} from '../../engine/viewers/Common';

interface CreateComposerOptions {
	renderer: AbstractRenderer;
	scene: PolyScene;
	camera: Camera;
	renderScene: Scene;
	viewer: BaseViewerType;
}

export class CoreCameraPostProcessController {
	static isPostProcessNetworkNode(node: BaseNodeType) {
		return (
			node.type() == NetworkNodeType.POST ||
			(node.context() == NodeContext.SOP && node.type() == CameraSopNodeType.POST_PROCESS)
		);
	}

	static createComposer(options: CreateComposerOptions) {
		const {renderer, scene, renderScene, camera, viewer} = options;

		let postProcessNode: BaseNetworkPostProcessNodeType | undefined;
		const postProcessNodeId = CoreObject.attribValue(camera, CameraAttribute.POST_PROCESS_NODE_ID);
		if (postProcessNodeId && CoreType.isNumber(postProcessNodeId)) {
			const foundNode = scene.graph.nodeFromId(postProcessNodeId);
			if (foundNode && foundNode instanceof TypedNode && this.isPostProcessNetworkNode(foundNode)) {
				postProcessNode = foundNode as BaseNetworkPostProcessNodeType;
			}
		}

		if (!postProcessNode) {
			return;
		}
		if (!(renderer instanceof WebGLRenderer)) {
			return;
		}

		return postProcessNode.effectsComposerController.createEffectsComposerAndBuildPasses({
			renderer,
			scene: renderScene,
			camera,
			viewer,
			// resolution,
			// requester: this.node,
			// render_target: render_target,
			// prepend_render_pass: this.node.pv.prepend_render_pass,
		});
	}

	// private _clear_render_passes(composer: EffectComposer) {
	// 	let render_pass: Pass | undefined;
	// 	while ((render_pass = composer.passes.pop())) {
	// 		if (render_pass) {
	// 			const disposable_pass: DisposablePass = render_pass as DisposablePass;
	// 			if (typeof disposable_pass.dispose === 'function') {
	// 				try {
	// 					disposable_pass.dispose();
	// 				} catch (e) {
	// 					console.warn(e);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
}
