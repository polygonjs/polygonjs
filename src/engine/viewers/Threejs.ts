import {Camera, Scene, WebGLRenderer} from 'three';
// import {ViewerControlsController} from './utils/ViewerControlsController';
import {TypedViewer, TypedViewerOptions} from './_Base';
import {Poly} from '../Poly';
import {ViewerLogoController} from './utils/logo/ViewerLogoController';
import {TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT} from '../scene/utils/TimeController';
import {CoreCameraRendererController} from '../../core/camera/CoreCameraRendererController';
import {CoreCameraPostProcessController} from '../../core/camera/CoreCameraPostProcessController';
import {CoreCameraCSSRendererController, CSSRendererConfig} from '../../core/camera/CoreCameraCSSRendererController';
import {CoreCameraControlsController} from '../../core/camera/CoreCameraControlsController';
import {CoreCameraRenderSceneController} from '../../core/camera/CoreCameraRenderSceneController';
// import type {EffectComposer} from '../../modules/core/post_process/EffectComposer';
import type {EffectComposer} from 'postprocessing';
const CSS_CLASS = 'CoreThreejsViewer';

declare global {
	interface HTMLCanvasElement {
		onwebglcontextlost: () => void;
		onwebglcontextrestored: () => void;
	}
}

// export interface ThreejsViewerProperties {
// 	autoRender?: boolean;
// }

export interface ThreejsViewerOptions<C extends Camera> extends TypedViewerOptions<C> {
	// properties?: ThreejsViewerProperties;
	renderer?: WebGLRenderer;
}

type RenderFuncWithDelta = (delta: number) => void;
type RenderFunc = () => void;

/**
 * threejs viewers are created by the [PerspectiveCamera](/docs/nodes/obj/perspectivecamera) and [OrthographicCamera](/docs/nodes/obj/orthographiccamera) object nodes. They inherit from [TypedViewer](/docs/api/TypedViewer).
 *
 */

export class ThreejsViewer<C extends Camera> extends TypedViewer<C> {
	private _requestAnimationFrameId: number | undefined;

	private _renderer: WebGLRenderer | undefined;
	private _rendererScene: Scene | undefined;
	private _renderFunc: RenderFuncWithDelta | undefined;
	private _renderCSSFunc: RenderFunc | undefined;
	private _cssRendererConfig: CSSRendererConfig | undefined;

	private _effectComposer: EffectComposer | undefined;

	private _animateMethod: () => void = this.animate.bind(this);
	static override _canvasIdPrefix() {
		return 'ThreejsViewer';
	}
	constructor(options: ThreejsViewerOptions<C>) {
		super(options);
		this._setupFunctions(options);
		// this._container.style.height = '100%'; // this should be app specific
	}
	private _setupFunctions(options: ThreejsViewerOptions<C>) {
		const camera = this.camera();
		const scene = this.scene();
		const canvas = this.canvas();
		const threejsScene = scene.threejsScene();

		this._renderer =
			options.renderer ||
			CoreCameraRendererController.createRenderer({
				camera,
				scene,
				canvas,
			});
		const renderer = this._renderer;
		if (renderer) {
			this._rendererScene = CoreCameraRenderSceneController.renderScene({camera, scene});
			const renderScene = this._rendererScene || threejsScene;
			this._effectComposer = CoreCameraPostProcessController.createComposer({
				camera,
				scene,
				renderScene,
				renderer,
				viewer: this,
			});
			this._cssRendererConfig = CoreCameraCSSRendererController.cssRendererConfig({scene, camera, canvas});
			this._controlsNode = CoreCameraControlsController.controlsNode({camera, scene});
			const cssRenderer = this._cssRendererConfig?.cssRenderer;
			this._renderCSSFunc = cssRenderer ? () => cssRenderer.render(renderScene, camera) : undefined;

			const effectComposer = this._effectComposer;
			if (effectComposer) {
				this._renderFunc = (delta) => effectComposer.render(delta);
			} else {
				this._renderFunc = () => {
					renderer.render(renderScene, camera);
				};
			}
		}
	}

	/**
	 * mounts the viewer onto an element
	 *
	 *
	 */
	override mount(element: HTMLElement) {
		super.mount(element);
		this._domElement?.appendChild(this.canvas());
		this._domElement?.classList.add(CSS_CLASS);

		const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
		if (cssRendererNode) {
			cssRendererNode.mountRenderer(this.canvas());
		}

		this._build();
		this._setEvents();
		this.onResize();

		if (Poly.logo.displayed()) {
			new ViewerLogoController(this);
		}
	}

	// override controlsController(): ViewerControlsController {
	// 	return (this._controlsController = this._controlsController || new ViewerControlsController(this));
	// }

	public _build() {
		this._initDisplay();
		this.activate();
	}

	/**
	 * disposes the viewer
	 *
	 *
	 */
	override dispose() {
		// dispose cssRenderer
		const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
		if (cssRendererNode) {
			cssRendererNode.unmountRenderer(this.canvas());
		}
		this._cssRendererConfig = undefined;

		// dispose effectComposer
		this._effectComposer = undefined;

		this.setAutoRender(false);

		this._cancelAnimate();
		// this.controlsController().dispose();
		this._disposeEvents();
		// if I dispose the renderer here,
		// this prevents env maps from displaying
		// when the viewer is switched
		// TODO: consider disposing the renderer only if it is not a default one,
		// as this may satisfy most cases
		//this._renderer?.dispose();
		super.dispose();
	}

	private _setEvents() {
		this.eventsController().init();
		this.webglController().init();

		this._disposeEvents();
		window.addEventListener('resize', this._onResizeBound, false);
	}
	private _disposeEvents() {
		window.removeEventListener('resize', this._onResizeBound, false);
	}
	private _onResizeBound = this.onResize.bind(this);
	onResize() {
		const canvas = this._canvas;
		if (!canvas) {
			return;
		}
		this.camerasController().computeSizeAndAspect();
		const size = this.camerasController().size;
		CoreCameraRendererController.setRendererSize(canvas, size);
		this._cssRendererConfig?.cssRenderer.setSize(size.x, size.y);
		this._effectComposer?.setSize(size.x, size.y);
		// this._cameraNode.renderController().setRendererSize(canvas, this.camerasController().size);
		this.camerasController().updateCameraAspect();
	}

	private _initDisplay() {
		if (!this._canvas) {
			console.warn('no canvas found for viewer');
			return;
		}
		this.camerasController().computeSizeAndAspect();
		// const size: Vector2 = this.camerasController().size;

		// const controller = this._cameraNode.renderController();
		// const existingRenderer = controller.renderer(this._canvas);
		// if (!existingRenderer) {
		// 	controller.createRenderer(this._canvas, size);
		// }
		// this.canvas_context = canvas.getContext('2d')

		this.audioController().update();
		// init renderer
		// renderer = new THREE.WebGLRenderer
		// 	canvas: canvas
		// 	antialias: true
		// 	alpha: true

		// renderer.shadowMap.enabled = true
		// this.compute_size_and_aspect()

		//
		// https://stackoverflow.com/questions/31407778/display-scene-at-lower-resolution-in-three-js
		// TODO: this article mentions that setSize should be called after
		// renderer.setSize(this._size[0], this._size[1])
		// renderer.setPixelRatio(window.devicePixelRatio)
		// renderer.setSize(size[0]*1.5, size[1]*1.5)
		// canvas.width = "//{size[0]}px"
		// canvas.height = "//{size[1]}px"
		// canvas.style.width = "//{size[0]}px"
		// canvas.style.height = "//{size[1]}px"

		// TODO: ensure the renderers get added to a list
		//if !this.player_mode
		//	console.log("set window.viewer_renderer from Threejs.vue component")
		// window.viewer_renderer = renderer
		// POLY.renderers_controller.register_renderer(renderer)

		// this.camerasController().prepareCurrentCamera();

		this.animate();
	}

	/**
	 * setAutoRender to false will stop the rendering. This can be useful if you know that nothing has changed in the scene, or if the renderer is currently not visible.
	 *
	 *
	 */
	override setAutoRender(state = true) {
		super.setAutoRender(state);
		// if this._requestAnimationFrameId is already defined,
		// calling this a second time would start another requestAnimationFrame
		// and we would therefore render at twice the rate
		if (this._doRender && this._requestAnimationFrameId == null) {
			this.animate();
		}
		if (!this._doRender) {
			this._cancelAnimate();
		}
	}

	animate() {
		if (this._doRender) {
			const delta = this._scene.timeController.updateClockDelta();
			this._requestAnimationFrameId = requestAnimationFrame(this._animateMethod);
			this._runOnBeforeTickCallbacks(delta);
			// this._scene.eventsDispatcher.connectionTriggerDispatcher.reset();
			this._scene.timeController.incrementTimeIfPlaying(TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT);
			this._runOnAfterTickCallbacks(delta);
			this.render(delta);
			// this.controlsController()?.update(delta);
		}
	}

	private _cancelAnimate() {
		this._doRender = false;
		if (this._requestAnimationFrameId != null) {
			cancelAnimationFrame(this._requestAnimationFrameId);
			this._requestAnimationFrameId = undefined;
		}
		if (this._canvas) {
			// this._cameraNode.renderController().deleteRenderer(this._canvas);
		}
	}

	render(delta: number) {
		if (this._canvas) {
			// const renderController = this._cameraNode.renderController();
			const renderer = this._renderer; //renderController.getRenderer(this._canvas);
			if (!renderer) {
				return;
			}
			this.scene().sceneTraverser.traverseScene();
			this._runOnBeforeRenderCallbacks(delta, renderer);
			// const size = this.camerasController().size;
			// const aspect = this.camerasController().aspect;
			// renderController.render(this._canvas, size, aspect, this._renderObjectOverride);
			if (this._renderFunc) {
				this._renderFunc(delta);
			}
			if (this._renderCSSFunc) {
				this._renderCSSFunc();
			}
			this.controlsController().update(delta);
			this._runOnAfterRenderCallbacks(delta, renderer);
		} else {
			console.warn('no canvas to render onto');
		}
	}

	/**
	 * returns the current renderer
	 *
	 *
	 */
	renderer() {
		return this._renderer;
		// if (this._canvas) {
		// 	// return this._cameraNode.renderController().renderer(this._canvas);
		// }
	}
	effectComposer() {
		return this._effectComposer;
	}
	preCompile() {
		if (!this._renderer) {
			return;
		}
		// if (this._canvas) {
		this._renderer.compile(this._scene.threejsScene(), this._camera);
		// }
	}
	override markAsReady() {
		this.preCompile();
		this.setAutoRender(true);
	}
}
