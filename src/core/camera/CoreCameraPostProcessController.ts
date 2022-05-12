import {Camera, Scene, WebGLRenderer} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import type {BaseNetworkPostProcessNodeType} from '../../engine/nodes/post/utils/EffectComposerController';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {CameraSopNodeType, NetworkNodeType, NodeContext} from '../../engine/poly/NodeContext';
import {CoreObject} from '../geometry/Object';
import {CoreType} from '../Type';
import {CameraAttribute} from './CoreCamera';

interface CreateComposerOptions {
	renderer: WebGLRenderer;
	scene: PolyScene;
	camera: Camera;
	renderScene: Scene;
}

export class CoreCameraPostProcessController {
	static isPostProcessNetworkNode(node: BaseNodeType) {
		return (
			node.type() == NetworkNodeType.POST ||
			(node.context() == NodeContext.SOP && node.type() == CameraSopNodeType.POST_PROCESS)
		);
	}

	static createComposer(options: CreateComposerOptions) {
		const {renderer, scene, renderScene, camera} = options;

		let postProcessNode: BaseNetworkPostProcessNodeType | undefined;
		const postProcessNodePath = CoreObject.attribValue(camera, CameraAttribute.POST_PROCESS_PATH);
		if (postProcessNodePath && CoreType.isString(postProcessNodePath)) {
			const foundNode = scene.node(postProcessNodePath);
			if (foundNode && this.isPostProcessNetworkNode(foundNode)) {
				postProcessNode = foundNode as BaseNetworkPostProcessNodeType;
			}
		}

		if (!postProcessNode) {
			return;
		}
		return postProcessNode.effectsComposerController.createEffectsComposer({
			renderer,
			scene: renderScene,
			camera,
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