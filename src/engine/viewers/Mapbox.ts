import mapboxgl from 'mapbox-gl';
import {TypedViewer, TypedViewerOptions} from './_Base';
// import {Poly} from '../Poly';
// import {ViewerLogoController} from './utils/logo/ViewerLogoController';
// import {
// 	// AvailableRenderConfig,
// 	CoreCameraRendererController,
// } from '../../core/camera/CoreCameraRendererController';
import {CoreCameraPostProcessController} from '../../core/camera/CoreCameraPostProcessController';
import {CoreCameraCSSRendererController, CSSRendererConfig} from '../../core/camera/CoreCameraCSSRendererController';
// import {CoreCameraControlsController} from '../../core/camera/CoreCameraControlsController';
import {CoreCameraRenderSceneController} from '../../core/camera/CoreCameraRenderSceneController';
import type {EffectComposer} from 'postprocessing';
// import {AbstractRenderer} from './Common';
import {RaycasterForBVH} from '../operations/sop/utils/Bvh/three-mesh-bvh';
import {MapboxPerspectiveCamera} from '../../core/thirdParty/Mapbox/MapboxPerspectiveCamera';
import {CoreStylesheetLoader} from '../../core/loader/Stylesheet';
import {MapboxMapsController} from '../../core/thirdParty/Mapbox/MapboxMapsController';
import {MapboxRaycaster} from '../../core/thirdParty/Mapbox/MapboxRaycaster';
// import {MapboxLayersController} from '../../core/thirdParty/Mapbox/LayersController';
import {Vector2, WebGLRenderer} from 'three';
const CSS_CLASS = 'CoreMapboxViewer';

// export interface ThreejsViewerProperties {
// 	autoRender?: boolean;
// }

export interface MapboxViewerOptions extends TypedViewerOptions<MapboxPerspectiveCamera> {
	// properties?: ThreejsViewerProperties;
	// renderer?: AbstractRenderer;
}

type RenderFuncWithDelta = (delta: number) => void;
type RenderFunc = () => void;

const CSS_URL = 'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css';
export class MapboxViewer extends TypedViewer<MapboxPerspectiveCamera> {
	private _map: mapboxgl.Map;
	private _canvasContainer: HTMLElement;
	// private _requestAnimationFrameId: number | undefined;
	private _renderer: WebGLRenderer | undefined;
	// private _rendererConfig: AvailableRenderConfig | undefined;
	private _renderFunc: RenderFuncWithDelta | undefined;
	private _renderCSSFunc: RenderFunc | undefined;
	private _cssRendererConfig: CSSRendererConfig | undefined;
	private _effectComposer: EffectComposer | undefined;
	// private _layersController: MapboxLayersController;

	static override _canvasIdPrefix() {
		return 'MapboxViewer';
	}
	constructor(private options: MapboxViewerOptions) {
		super(options);

		this._canvasContainer = document.createElement('div');
		this._canvasContainer.id = `mapbox_container_id_${Math.random()}`.replace('.', '_');
		this._canvasContainer.style.height = '100%';
		CoreStylesheetLoader.loadUrl(CSS_URL);
		const data = MapboxMapsController.createMap({
			camera: options.camera,
			container: this._canvasContainer,
			scene: options.scene,
			renderFunc: this._animateCommonBound,
			viewer: this,
		});
		this._map = data.map;
		// this._layersController = data.layersController;
		this._map.on('resize', this._onResizeBound);
		// const canvas = this._map.getCanvas();
		// const context = Poly.renderersController.getRenderingContext(canvas)!;
		// this._renderer = new WebGLRenderer({
		// 	// alpha: true
		// 	// antialias: true,
		// 	canvas,
		// 	context,
		// });
		// this._renderer.autoClear = false;
		// this._renderer.shadowMap.enabled = true;

		// this._container.style.height = '100%'; // this should be app specific
	}
	override createRaycaster() {
		const raycaster = new MapboxRaycaster();
		(raycaster as any as RaycasterForBVH).firstHitOnly = true;
		return raycaster;
	}
	setRenderer(renderer: WebGLRenderer) {
		this._renderer = renderer;
		this._setupFunctions(renderer, this.options);
	}
	renderer() {
		return this._renderer;
	}
	override canvas() {
		return this._map.getCanvas();
	}

	private _setupFunctions(renderer: WebGLRenderer, options: MapboxViewerOptions) {
		const camera = this.camera();
		const scene = this.scene();
		const canvas = this.canvas();
		const threejsScene = scene.threejsScene();

		// WebGLRenderer
		// this._renderer = options.renderer;
		// if (!this._renderer) {
		// 	this._rendererConfig = CoreCameraRendererController.rendererConfig({
		// 		camera,
		// 		scene,
		// 		canvas,
		// 	});
		// 	if (this._rendererConfig) {
		// 		this._renderer = this._rendererConfig.renderer;
		// 	}
		// }

		// const renderer = this._renderer;
		// if (!renderer) {
		// 	console.error('no renderer');
		// }
		// if (renderer) {
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
		// if (renderer instanceof WebGLRenderer) {
		// 	this._webXRConfig = CoreCameraWebXRController.process({
		// 		camera,
		// 		scene,
		// 		renderer,
		// 		canvas: this.canvas(),
		// 	});
		// 	this._markerTrackingConfig = CoreCameraMarkerTrackingController.process({
		// 		canvas,
		// 		camera,
		// 		scene,
		// 	});
		// }
		// CSSRender
		this._cssRendererConfig = CoreCameraCSSRendererController.cssRendererConfig({scene, camera, canvas});
		const cssRenderer = this._cssRendererConfig?.cssRenderer;
		this._renderCSSFunc = cssRenderer ? () => cssRenderer.render(renderScene, camera) : undefined;
		// controls
		// this._controlsNode = CoreCameraControlsController.controlsNode({camera, scene});
		// renderFunc
		if (effectComposer) {
			this._renderFunc = (delta) => effectComposer.render(delta);
		} else {
			this._renderFunc = () => renderer.render(renderScene, camera);
		}
		// }
		this._mountCSSRenderer();
	}

	/**
	 * mounts the viewer onto an element
	 *
	 *
	 */
	override mount(element: HTMLElement) {
		super.mount(element);

		this._domElement?.appendChild(this._canvasContainer);
		this._domElement?.classList.add(CSS_CLASS);

		// // this.mapboxEventController.init_events();
		// this._map.on('load', () => {
		// 	if (this._map) {
		// 		// this._mapLoaded = true;

		// 		// this._canvas = this._findCanvas();
		// 		// this.eventsController().init();
		// 		// MapsRegister.instance().registerMap(this._canvasContainer.id, this._map);
		// 		// this.layersController.addLayers();
		// 		// this.mapboxEventController.camera_node_move_end(); // to update mapbox planes
		// 		// window.dispatchEvent(new Event('resize')); // helps making sure it is resized correctly
		// 	}
		// });

		// this._map.on('resize', this._onResizeBound);

		// this._domElement?.appendChild(canvas);
		// this._domElement?.classList.add(CSS_CLASS);

		// mount CSSRenderer

		// // mount webXR
		// this._webXRConfig?.mountFunction();
		// this._markerTrackingConfig?.mountFunction();

		// this._build();
		this._setEvents();
		// this.onResize();

		// if (Poly.logo.displayed()) {
		// 	new ViewerLogoController(this);
		// }
	}
	private _mountCSSRenderer() {
		const canvas = this._map.getCanvas();
		const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
		if (cssRendererNode) {
			cssRendererNode.mountRenderer(canvas);
		}
	}

	public _build() {
		// this._initDisplay();
		this.activate();
	}

	/**
	 * disposes the viewer
	 *
	 *
	 */
	// override dispose() {
	// 	const canvas = this.canvas();
	// 	// dispose cssRenderer
	// 	const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
	// 	if (cssRendererNode) {
	// 		cssRendererNode.unmountRenderer(canvas);
	// 	}
	// 	this._cssRendererConfig = undefined;
	// 	// dispose webXR
	// 	this._webXRConfig?.unmountFunction();
	// 	this._markerTrackingConfig?.unmountFunction();

	// 	// dispose effectComposer
	// 	this._effectComposer = undefined;

	// 	this.setAutoRender(false);

	// 	this._cancelAnimate();
	// 	// this.controlsController().dispose();
	// 	this._disposeEvents();
	// 	// if I dispose the renderer here,
	// 	// this prevents env maps from displaying
	// 	// when the viewer is switched
	// 	// TODO: consider disposing the renderer only if it is not a default one,
	// 	// as this may satisfy most cases
	// 	//this._renderer?.dispose();
	// 	super.dispose();
	// }

	private _setEvents() {
		this.eventsController().init();
		this.webglController().init();

		// this._disposeEvents();
		// window.addEventListener('resize', this._onResizeBound, false);
	}
	// private _disposeEvents() {
	// 	window.removeEventListener('resize', this._onResizeBound, false);
	// }
	private _onResizeBound = this.onResize.bind(this);
	private _size = new Vector2();
	onResize() {
		const canvas = this._map.getCanvas();
		const rect = canvas.getBoundingClientRect();
		this._size.set(rect.width, rect.height);
		// this._layersController.resize(this._size);
		// this.mapboxEventController.camera_node_move_end();
		// const canvas = this._canvas;
		// if (!canvas) {
		// 	return;
		// }
		if (!this._renderer) {
			// console.error('resize: no renderer');
			return;
		}

		const devicePixelRatio = window.devicePixelRatio;
		this._renderer.setSize(this._size.x * devicePixelRatio, this._size.y * devicePixelRatio, false);

		// const pixelRatio = this._renderer.getPixelRatio();
		this.camerasController().computeSizeAndAspect(window.devicePixelRatio);
		// const size = this.camerasController().size;
		// CoreCameraRendererController.setRendererSize(canvas, size);
		this._cssRendererConfig?.cssRenderer.setSize(this._size.x, this._size.y);
		this._effectComposer?.setSize(this._size.x, this._size.y);
		this.camerasController().updateCameraAspect();
	}

	// private _initDisplay() {
	// 	if (!this._canvas) {
	// 		console.warn('no canvas found for viewer');
	// 		return;
	// 	}
	// 	if (!this._renderer) {
	// 		return;
	// 	}

	// 	const pixelRatio = this._renderer.getPixelRatio();
	// 	this.camerasController().computeSizeAndAspect(pixelRatio);
	// 	this.audioController().update();
	// 	this._startAnimate();
	// }

	/**
	 * setAutoRender to false will stop the rendering. This can be useful if you know that nothing has changed in the scene, or if the renderer is currently not visible.
	 *
	 *
	 */
	// override setAutoRender(state = true) {
	// 	super.setAutoRender(state);
	// 	// if this._requestAnimationFrameId is already defined,
	// 	// calling this a second time would start another requestAnimationFrame
	// 	// and we would therefore render at twice the rate
	// 	if (this._doRender && this._requestAnimationFrameId == null) {
	// 		this._startAnimate();
	// 	}
	// 	if (!this._doRender) {
	// 		this._cancelAnimate();
	// 	}
	// }

	isXR(): boolean {
		return false;
	}
	// private _startAnimate() {
	// 	// if (this.isXR()) {
	// 	// 	const renderer = this._renderer as WebGLRenderer;
	// 	// 	if (!renderer) {
	// 	// 		return;
	// 	// 	}

	// 	// 	const webXRController = this.scene().webXR;
	// 	// 	const xrCallback: XRFrameRequestCallback = (timestamp, frame) => {
	// 	// 		webXRController.activeXRController()?.process(frame);

	// 	// 		this._animateWebXR();
	// 	// 	};
	// 	// 	renderer.setAnimationLoop(xrCallback);
	// 	// } else {
	// 	this._animateWeb();
	// 	// }
	// }
	// private _cancelAnimate() {
	// 	// if (this.isXR()) {
	// 	// 	(this._renderer as WebGLRenderer)?.setAnimationLoop(null);
	// 	// } else {
	// 	this._cancelAnimateCommon();
	// 	// }
	// }

	// private _animateWebBound: () => void = this._animateWeb.bind(this);
	// private _animateWeb() {
	// 	if (!this._doRender) {
	// 		return;
	// 	}
	// 	this._requestAnimationFrameId = requestAnimationFrame(this._animateWebBound);
	// 	this.__animateCommon__();
	// }
	// private _animateWebXR() {
	// 	this.__animateCommon__();
	// }
	private _animateCommonBound = this.__animateCommon__.bind(this);
	private __animateCommon__() {
		const delta = this._scene.timeController.updateClockDelta();
		this._runOnBeforeTickCallbacks(delta);
		this.scene().update(delta);
		this._runOnAfterTickCallbacks(delta);
		// this._markerTrackingConfig?.renderFunction();
		this.render(delta);
	}

	// private _cancelAnimateCommon() {
	// 	this._doRender = false;
	// 	if (this._requestAnimationFrameId != null) {
	// 		cancelAnimationFrame(this._requestAnimationFrameId);
	// 		this._requestAnimationFrameId = undefined;
	// 	}
	// 	if (this._canvas) {
	// 		// this._cameraNode.renderController().deleteRenderer(this._canvas);
	// 	}
	// }

	override render(delta: number) {
		// if (this._canvas) {
		super.render(delta);
		const renderer = this._renderer;
		if (!renderer) {
			console.error('render: no renderer');
			return;
		}

		this._runOnBeforeRenderCallbacks(delta, renderer);
		if (this._renderFunc) {
			this._renderFunc(delta);
		}
		if (this._renderCSSFunc) {
			this._renderCSSFunc();
		}
		// this.controlsController().update(delta);
		this._runOnAfterRenderCallbacks(delta, renderer);
		// } else {
		// 	console.warn('no canvas to render onto');
		// }
	}

	/**
	 * returns the current renderer
	 *
	 *
	 */
	// renderer() {
	// 	return this._renderer;
	// 	// if (this._canvas) {
	// 	// 	// return this._cameraNode.renderController().renderer(this._canvas);
	// 	// }
	// }
	// effectComposer() {
	// 	return this._effectComposer;
	// }
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
