import {Camera, WebGLRenderer} from 'three';
import {TypedViewer, TypedViewerOptions} from './_Base';
import {Poly} from '../Poly';
import {ViewerLogoController} from './utils/logo/ViewerLogoController';
import {AvailableRenderConfig, CoreCameraRendererController} from '../../core/camera/CoreCameraRendererController';
import {CoreCameraPostProcessController} from '../../core/camera/CoreCameraPostProcessController';
import {CoreCameraCSSRendererController, CSSRendererConfig} from '../../core/camera/CoreCameraCSSRendererController';
import {CoreCameraControlsController} from '../../core/camera/CoreCameraControlsController';
import {CoreCameraRenderSceneController} from '../../core/camera/CoreCameraRenderSceneController';
import type {EffectComposer} from 'postprocessing';
import {AbstractRenderer} from './Common';
import {CoreCameraWebXRController, CoreCameraWebXRControllerConfig} from '../../core/camera/webXR/CoreCameraWebXR';
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
	// renderer?: AbstractRenderer;
}

type RenderFuncWithDelta = (delta: number) => void;
type RenderFunc = () => void;

/**
 * threejs viewers are created by the [PerspectiveCamera](/docs/nodes/obj/perspectivecamera) and [OrthographicCamera](/docs/nodes/obj/orthographiccamera) object nodes. They inherit from [TypedViewer](/docs/api/TypedViewer).
 *
 */

export class ThreejsViewer<C extends Camera> extends TypedViewer<C> {
	private _requestAnimationFrameId: number | undefined;

	private _webXRConfig: CoreCameraWebXRControllerConfig | undefined;
	private _renderer: AbstractRenderer | undefined;
	private _rendererConfig: AvailableRenderConfig | undefined;
	private _renderFunc: RenderFuncWithDelta | undefined;
	private _renderCSSFunc: RenderFunc | undefined;
	private _cssRendererConfig: CSSRendererConfig | undefined;

	private _effectComposer: EffectComposer | undefined;

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

		// WebGLRenderer
		this._renderer = options.renderer;
		if (!this._renderer) {
			this._rendererConfig = CoreCameraRendererController.rendererConfig({
				camera,
				scene,
				canvas,
			});
			if (this._rendererConfig) {
				this._renderer = this._rendererConfig.renderer;
			}
		}

		const renderer = this._renderer;
		if (!renderer) {
			console.error('no renderer');
		}
		if (renderer) {
			// scene
			const rendererScene = CoreCameraRenderSceneController.renderScene({camera, scene});
			const renderScene = rendererScene || threejsScene;
			// post
			this._effectComposer = CoreCameraPostProcessController.createComposer({
				camera,
				scene,
				renderScene,
				renderer,
				viewer: this,
			});
			const effectComposer = this._effectComposer;
			// webXR
			if (renderer instanceof WebGLRenderer) {
				this._webXRConfig = CoreCameraWebXRController.process({
					camera,
					scene,
					renderer,
					canvas: this.canvas(),
				});
			}
			// CSSRender
			this._cssRendererConfig = CoreCameraCSSRendererController.cssRendererConfig({scene, camera, canvas});
			const cssRenderer = this._cssRendererConfig?.cssRenderer;
			this._renderCSSFunc = cssRenderer ? () => cssRenderer.render(renderScene, camera) : undefined;
			// controls
			this._controlsNode = CoreCameraControlsController.controlsNode({camera, scene});
			// renderFunc
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
		const canvas = this.canvas();
		this._domElement?.appendChild(canvas);
		this._domElement?.classList.add(CSS_CLASS);

		// mount CSSRenderer
		const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
		if (cssRendererNode) {
			cssRendererNode.mountRenderer(canvas);
		}
		// mount webXR
		this._webXRConfig?.mountFunction();

		this._build();
		this._setEvents();
		this.onResize();

		if (Poly.logo.displayed()) {
			new ViewerLogoController(this);
		}
	}

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
		const canvas = this.canvas();
		// dispose cssRenderer
		const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
		if (cssRendererNode) {
			cssRendererNode.unmountRenderer(canvas);
		}
		this._cssRendererConfig = undefined;
		// dispose webXR
		this._webXRConfig?.unmountFunction();

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
		if (!this._renderer) {
			return;
		}

		const pixelRatio = this._renderer.getPixelRatio();
		this.camerasController().computeSizeAndAspect(pixelRatio);
		const size = this.camerasController().size;
		CoreCameraRendererController.setRendererSize(canvas, size);
		this._cssRendererConfig?.cssRenderer.setSize(size.x, size.y);
		this._effectComposer?.setSize(size.x, size.y);
		this.camerasController().updateCameraAspect();
	}

	private _initDisplay() {
		if (!this._canvas) {
			console.warn('no canvas found for viewer');
			return;
		}
		if (!this._renderer) {
			return;
		}

		const pixelRatio = this._renderer.getPixelRatio();
		this.camerasController().computeSizeAndAspect(pixelRatio);
		this.audioController().update();
		this._startAnimate();
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
			this._startAnimate();
		}
		if (!this._doRender) {
			this._cancelAnimate();
		}
	}

	isXR(): boolean {
		if (!this._renderer) {
			return false;
		}
		return this._renderer instanceof WebGLRenderer && this._renderer.xr.enabled;
	}
	private _startAnimate() {
		if (this.isXR()) {
			const renderer = this._renderer as WebGLRenderer;
			if (!renderer) {
				return;
			}

			const webXRController = this.scene().webXR;
			const xrCallback: XRFrameRequestCallback = (timestamp, frame) => {
				webXRController.activeXRController()?.process(frame);

				this._animateWebXR();
			};
			renderer.setAnimationLoop(xrCallback);
		} else {
			this._animateWeb();
		}
	}
	private _cancelAnimate() {
		if (this.isXR()) {
			(this._renderer as WebGLRenderer)?.setAnimationLoop(null);
		} else {
			this._cancelAnimateCommon();
		}
	}

	private _animateWebBound: () => void = this._animateWeb.bind(this);
	private _animateWeb() {
		if (!this._doRender) {
			return;
		}
		this._requestAnimationFrameId = requestAnimationFrame(this._animateWebBound);
		this.__animateCommon__();
	}
	private _animateWebXR() {
		this.__animateCommon__();
	}
	private __animateCommon__() {
		const delta = this._scene.timeController.updateClockDelta();
		this._runOnBeforeTickCallbacks(delta);
		this.scene().update(delta);
		this._runOnAfterTickCallbacks(delta);
		this.render(delta);
	}

	private _cancelAnimateCommon() {
		this._doRender = false;
		if (this._requestAnimationFrameId != null) {
			cancelAnimationFrame(this._requestAnimationFrameId);
			this._requestAnimationFrameId = undefined;
		}
		if (this._canvas) {
			// this._cameraNode.renderController().deleteRenderer(this._canvas);
		}
	}

	override render(delta: number) {
		if (this._canvas) {
			super.render(delta);
			const renderer = this._renderer;
			if (!renderer) {
				return;
			}

			this._runOnBeforeRenderCallbacks(delta, renderer);
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
