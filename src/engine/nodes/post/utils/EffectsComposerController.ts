import {Constructor, valueof} from '../../../../types/GlobalTypes';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget, WebGLRenderTargetOptions} from 'three/src/renderers/WebGLRenderTarget';
import {EffectComposer} from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from '../../../../modules/three/examples/jsm/postprocessing/RenderPass';
import {DisplayNodeController, DisplayNodeControllerCallbacks} from '../../utils/DisplayNodeController';
import {PostNodeChildrenMap} from '../../../poly/registers/nodes/Post';
import {TypedNode, BaseNodeType} from '../../_Base';
import {BasePostProcessNodeType} from '../_Base';
import {Scene} from 'three/src/scenes/Scene';
import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {BaseCameraObjNodeType} from '../../obj/_BaseCamera';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {RGBFormat} from 'three/src/constants';
import {Poly} from '../../../Poly';

import {
	MAG_FILTER_DEFAULT_VALUE,
	MAG_FILTER_MENU_ENTRIES,
	MIN_FILTER_DEFAULT_VALUE,
	MIN_FILTER_MENU_ENTRIES,
} from '../../../../core/cop/ConstantFilter';
export class PostProcessNetworkParamsConfig extends NodeParamsConfig {
	prepend_render_pass = ParamConfig.BOOLEAN(1);
	useRenderTarget = ParamConfig.BOOLEAN(1);
	tmagFilter = ParamConfig.BOOLEAN(0, {
		visibleIf: {useRenderTarget: 1},
	});
	magFilter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
		visibleIf: {useRenderTarget: 1, tmagFilter: 1},
		menu: {
			entries: MAG_FILTER_MENU_ENTRIES,
		},
	});
	tminFilter = ParamConfig.BOOLEAN(0, {
		visibleIf: {useRenderTarget: 1},
	});
	minFilter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
		visibleIf: {useRenderTarget: 1, tminFilter: 1},
		menu: {
			entries: MIN_FILTER_MENU_ENTRIES,
		},
	});
	stencilBuffer = ParamConfig.BOOLEAN(0, {
		visibleIf: {useRenderTarget: 1},
	});
	sampling = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, false],
	});
}
export interface BaseNetworkPostProcessNodeType extends TypedNode<any, PostProcessNetworkParamsConfig> {
	readonly displayNodeController: DisplayNodeController;
	createNode<S extends keyof PostNodeChildrenMap>(node_class: S): PostNodeChildrenMap[S];
	createNode<K extends valueof<PostNodeChildrenMap>>(node_class: Constructor<K>): K;
	children(): BasePostProcessNodeType[];
	nodesByType<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][];

	readonly effectsComposerController: EffectsComposerController;
}

interface CreateEffectsComposerOptions {
	renderer: WebGLRenderer;
	scene: Scene;
	camera: Camera;
	resolution: Vector2;
	// render_target?: WebGLRenderTarget;
	requester: BaseNodeType;
	camera_node?: BaseCameraObjNodeType;
	// useRenderTarget?: boolean;
	// prepend_render_pass?: boolean;
}

export class EffectsComposerController {
	constructor(private node: BaseNetworkPostProcessNodeType) {}

	displayNodeControllerCallbacks(): DisplayNodeControllerCallbacks {
		return {
			onDisplayNodeRemove: () => {},
			onDisplayNodeSet: () => {
				this.node.setDirty();
			},
			onDisplayNodeUpdate: () => {
				this.node.setDirty();
			},
		};
	}

	createEffectsComposer(options: CreateEffectsComposerOptions) {
		const renderer = options.renderer;

		let composer: EffectComposer;
		if (this.node.pv.useRenderTarget) {
			const render_target = this._create_render_target(renderer);
			composer = new EffectComposer(renderer, render_target);
		} else {
			composer = new EffectComposer(renderer);
		}

		// to achieve better antialiasing
		// while using post:
		composer.setPixelRatio(window.devicePixelRatio * this.node.pv.sampling);
		// be careful, as this messes up with the renderer
		// and when using in cop/post has the output texture be 2x as large
		// composer.setPixelRatio(window.devicePixelRatio * 1);

		this._build_passes(composer, options);

		return composer;
	}

	private _renderer_size = new Vector2();
	private _create_render_target(renderer: WebGLRenderer) {
		let render_target: WebGLRenderTarget | undefined;
		renderer.autoClear = false;
		const parameters: WebGLRenderTargetOptions = {
			// format: RGBFormat,
			format: RGBFormat,
			stencilBuffer: this.node.pv.stencilBuffer,
		};
		if (this.node.pv.tminFilter) {
			parameters.minFilter = this.node.pv.minFilter;
		}
		if (this.node.pv.tminFilter) {
			parameters.magFilter = this.node.pv.magFilter;
		}

		renderer.getDrawingBufferSize(this._renderer_size);
		render_target = Poly.renderersController.renderTarget(this._renderer_size.x, this._renderer_size.y, parameters);
		return render_target;
	}

	private _build_passes(composer: EffectComposer, options: CreateEffectsComposerOptions) {
		if (this.node.pv.prepend_render_pass == true) {
			const render_pass = new RenderPass(options.scene, options.camera);
			composer.addPass(render_pass);
		}

		const post_node = this.node.displayNodeController.displayNode() as BasePostProcessNodeType;
		if (post_node) {
			post_node.setup_composer({
				composer: composer,
				camera: options.camera,
				resolution: options.resolution,
				camera_node: options.camera_node,
				scene: options.scene,
				requester: options.requester,
			});
		}
	}
}
