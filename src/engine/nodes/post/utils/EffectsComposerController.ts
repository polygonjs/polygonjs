import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {LinearFilter, RGBFormat} from 'three/src/constants';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {EffectComposer} from '../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from '../../../../../modules/three/examples/jsm/postprocessing/RenderPass';
import {DisplayNodeController, DisplayNodeControllerCallbacks} from '../../utils/DisplayNodeController';
import {PostNodeChildrenMap} from '../../../poly/registers/nodes/Post';
import {BaseNodeType} from '../../_Base';
import {BasePostProcessNodeType} from '../_Base';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {BaseCameraObjNodeType} from '../../obj/_BaseCamera';

export interface BaseNetworkPostProcessNodeType extends BaseNodeType {
	readonly display_node_controller: DisplayNodeController;
	create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K];
	children(): BasePostProcessNodeType[];
	nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];

	readonly effects_composer_controller: EffectsComposerController;
}

interface CreateEffectsComposerOptions {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: Camera;
	resolution: Vector2;
	canvas: HTMLCanvasElement;
	camera_node?: BaseCameraObjNodeType;
	use_render_target?: boolean;
	prepend_render_pass?: boolean;
}

export class EffectsComposerController {
	constructor(private node: BaseNetworkPostProcessNodeType) {}

	display_node_controller_callbacks(): DisplayNodeControllerCallbacks {
		return {
			on_display_node_remove: () => {},
			on_display_node_set: () => {
				this.node.set_dirty();
			},
			on_display_node_update: () => {},
		};
	}

	create_effects_composer(options: CreateEffectsComposerOptions) {
		const renderer = options.renderer;

		let composer: EffectComposer;
		if (options.use_render_target) {
			renderer.autoClear = false;
			const parameters = {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBFormat,
				stencilBuffer: true,
			};

			const render_target = new WebGLRenderTarget(
				renderer.domElement.offsetWidth,
				renderer.domElement.offsetHeight,
				parameters
			);
			composer = new EffectComposer(renderer, render_target);
		} else {
			composer = new EffectComposer(renderer);
		}
		// to achieve better antialiasing
		// while using post:
		// composer.setPixelRatio( window.devicePixelRatio*2 )
		composer.setPixelRatio(window.devicePixelRatio * 1);

		this._build_passes(composer, options);

		return composer;
	}

	private _build_passes(composer: EffectComposer, options: CreateEffectsComposerOptions) {
		if (options.prepend_render_pass == true) {
			const render_pass = new RenderPass(options.scene, options.camera);
			composer.addPass(render_pass);
		}

		const post_node = this.node.display_node_controller.display_node as BasePostProcessNodeType;
		post_node.setup_composer({
			composer: composer,
			camera: options.camera,
			resolution: options.resolution,
			camera_node: options.camera_node,
			scene: options.scene,
			canvas: options.canvas,
		});
	}
}
