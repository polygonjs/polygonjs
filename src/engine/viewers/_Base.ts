import {ApplicableControlsNode} from './../../core/camera/CoreCameraControlsController';
import {createRaycaster} from './../../core/RaycastHelper';
import {ViewerCamerasController} from './utils/ViewerCamerasController';
import {ViewerControlsController} from './utils/ViewerControlsController';
import {ViewerEventsController} from './utils/ViewerEventsController';
import {ViewerWebGLController} from './utils/ViewerWebglController';
import {ViewerAudioController} from './utils/ViewerAudioController';
import {Camera, Object3D} from 'three';
import {PolyScene} from '../scene/PolyScene';
import {Poly, PolyEngine} from '../Poly';
import {AbstractRenderer} from './Common';
import {ViewerRaycastersController} from './utils/ViewerRaycastersController';
import {ViewerPerformanceMonitor} from './utils/ViewerPerformanceMonitor';
import {AvailableRenderConfig} from '../../core/camera/CoreCameraRendererController';

const HOVERED_CLASS_NAME = 'hovered';

type ViewerTickCallback = (delta: number) => void;
type ViewerRenderCallback = (delta: number, renderer: AbstractRenderer) => void;
type ViewerBaseCallback = ViewerTickCallback | ViewerRenderCallback;
interface BaseViewerCallbackOptions {
	persistent?: boolean;
}
interface ViewerCallbackContainer<T extends ViewerBaseCallback> {
	callback: T;
	options: BaseViewerCallbackOptions;
}
type ViewerCallbacksMap<T extends ViewerBaseCallback> = Map<string, ViewerCallbackContainer<T>>;
export interface HTMLElementWithViewer<C extends Camera> extends HTMLElement {
	scene: PolyScene;
	viewer: TypedViewer<C>;
	Poly: PolyEngine;
}
type UpdateCameraAspectCallback = (aspect: number) => void;

export interface CreateViewerOptions {
	canvas?: HTMLCanvasElement;
	autoRender?: boolean;
	renderer?: AbstractRenderer;
	cameraMaskOverride?: string;
}
export interface TypedViewerOptions<C extends Camera> extends CreateViewerOptions {
	camera: C;
	scene: PolyScene;
	updateCameraAspect: UpdateCameraAspectCallback;
}
export interface TypedViewerInterectionObserverChangeOptions {
	root?: HTMLElement;
	rootMargin?: string;
	threshold?: number;
	playPauseScene?: boolean;
	onChange?: (isIntersecting: boolean) => void;
}
export interface BaseViewerMountOptions {
	updateAutoRenderOnIntersectionChange?: boolean;
}

/**
 *
 *
 * Base class to create a viewer. It is used for the [Threejs viewer](/docs/api/ThreejsViewer) as well as the [Mapbox Viewer](https://github.com/polygonjs/plugin-mapbox)
 *
 */
export abstract class TypedViewer<C extends Camera> {
	// protected _display_scene: Scene;
	// protected _canvas: HTMLCanvasElement | undefined;
	protected _domElement: HTMLElementWithViewer<C> | undefined;
	protected _active: boolean = false;
	private static _nextViewerId = 0;
	private _id: Readonly<string>;
	protected _renderObjectOverride: Object3D | undefined;
	protected _canvas: HTMLCanvasElement | undefined;
	protected _camera: C;
	protected _scene: PolyScene;
	public readonly updateCameraAspect: UpdateCameraAspectCallback;
	protected _doRender: boolean = true;
	protected _controlsNode: ApplicableControlsNode | undefined;

	constructor(options: TypedViewerOptions<C>) {
		this._id = TypedViewer._nextId();
		this._camera = options.camera;
		this._scene = options.scene;
		this._canvas = options.canvas;
		if (options.autoRender != null) {
			this._doRender = options.autoRender;
		}
		this.updateCameraAspect = options.updateCameraAspect;
		this.scene().viewersRegister.registerViewer(this);

		// init in constructor to ensure scene is present in viewer
		this.raycastersController = new ViewerRaycastersController(this);
	}
	private static _nextId() {
		return `${TypedViewer._nextViewerId++}`;
	}
	createRaycaster() {
		return createRaycaster();
	}
	abstract renderer(): AbstractRenderer | undefined;
	abstract rendererConfig(): AvailableRenderConfig | undefined;

	protected _mounted = false;
	/**
	 * mounts the viewer onto an element
	 *
	 *
	 */
	mount(element: HTMLElement, options?: BaseViewerMountOptions) {
		let updateAutoRenderOnIntersectionChange = true;
		if (options && options.updateAutoRenderOnIntersectionChange != null) {
			updateAutoRenderOnIntersectionChange = options.updateAutoRenderOnIntersectionChange;
		}

		this._domElement = element as HTMLElementWithViewer<C>;
		this._domElement.viewer = this;
		this._domElement.scene = this._scene;
		this._domElement.Poly = Poly;
		if (updateAutoRenderOnIntersectionChange) {
			this.updateAutoRenderOnIntersectionChange({playPauseScene: true});
		}
		this.controlsController().mount();
		this._mounted = true;
	}
	/**
	 * unmounts the viewer
	 *
	 *
	 */
	unmount() {
		if (!this._domElement) {
			return;
		}
		// let childElement: Element | undefined;
		// while ((childElement = this._domElement.children[0])) {
		// 	this._domElement.removeChild(childElement);
		// }
		// when unmounting, it is very unsafe to remove all HTMLElements
		// that have been created inside _domElement
		// as those could have been created by an app specific code
		// OR... those could have been created when an element is shared by multiple scenes
		// at different times
		this._audioController?.unmount();

		this._domElement.removeChild(this.canvas());
		this.controlsController().unmount();

		this._mounted = false;
	}
	static _canvasIdPrefix() {
		return 'TypedViewer';
	}
	static createCanvas(id?: string) {
		id = id || TypedViewer._nextId();
		const canvas = document.createElement('canvas');
		canvas.id = `${this._canvasIdPrefix()}_${id}`;
		canvas.style.display = 'block';
		canvas.style.outline = 'none';
		// we add 100% to the width and height
		// to make it easy for the canvas to not grow larger
		// than its container, without requiring css to enforce this
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		return canvas;
	}

	controlsNode() {
		return this._controlsNode;
	}
	/**
	 * return the canvas and create one if none yet
	 *
	 *
	 */
	canvas() {
		return (this._canvas = this._canvas || TypedViewer.createCanvas(this._id));
	}

	render(delta: number) {
		this._scene.viewersRegister.markViewerAsRendered(this);
		this.raycastersController.updateRaycasters();
		if (this.scene().timeController.playing()) {
			this.performanceMonitor.measurePerformance(delta);
		}
	}

	setRenderObjectOverride(object?: Object3D | null) {
		if (object) {
			this._renderObjectOverride = object;
		} else {
			this._renderObjectOverride = undefined;
		}
	}

	active() {
		return this._active;
	}
	activate() {
		this._active = true;
	}
	deactivate() {
		this._active = false;
	}

	protected _camerasController: ViewerCamerasController | undefined;
	camerasController(): ViewerCamerasController {
		return (this._camerasController = this._camerasController || new ViewerCamerasController(this));
	}
	protected _controlsController: ViewerControlsController<C> = new ViewerControlsController(this);
	controlsController() {
		return this._controlsController;
	}
	protected _eventsController: ViewerEventsController | undefined;
	eventsController(): ViewerEventsController {
		return (this._eventsController = this._eventsController || new ViewerEventsController(this));
	}
	protected _webGLController: ViewerWebGLController | undefined;
	webglController(): ViewerWebGLController {
		return (this._webGLController = this._webGLController || new ViewerWebGLController(this));
	}
	private _audioController: ViewerAudioController | undefined;
	audioController(): ViewerAudioController {
		return (this._audioController = this._audioController || new ViewerAudioController(this));
	}
	public readonly raycastersController: ViewerRaycastersController;
	public readonly performanceMonitor: ViewerPerformanceMonitor = new ViewerPerformanceMonitor(this);

	domElement() {
		return this._domElement;
	}
	scene() {
		return this._scene;
	}

	/**
	 * return the camera the viewer was created with
	 *
	 *
	 */
	camera() {
		return this._camera;
	}
	// cameraControlsController(): ThreejsCameraControlsController | undefined {
	// 	return undefined;
	// }
	id() {
		return this._id;
	}

	/**
	 * disposes the viewer
	 *
	 *
	 */
	dispose() {
		this._scene.viewersRegister.unregisterViewer(this);
		this.eventsController().dispose();
		this.controlsController().unmount();
		if (!this._domElement) {
			return;
		}
		let child: Element;
		while ((child = this._domElement.children[0])) {
			this._domElement.removeChild(child);
		}
	}

	// html container class
	resetContainerClass() {
		this.domElement()?.classList.remove(HOVERED_CLASS_NAME);
	}
	setContainerClassHovered() {
		this.domElement()?.classList.add(HOVERED_CLASS_NAME);
	}
	markAsReady() {}

	/**
	 * sets auto render state. If falls, the viewer will not render.
	 *
	 *
	 */
	setAutoRender(state = true) {
		this._doRender = state;
	}
	autoRenderState(): boolean {
		return this._doRender;
	}

	//
	//
	// Visibility detection
	//
	//
	private _observer: IntersectionObserver | undefined;
	/**
	 * This sets the viewer to detect if it is visible, and to pause/unpause itself when its visibility changes.
	 * This can be very useful to improve performance.
	 *
	 */
	updateAutoRenderOnIntersectionChange(_options: TypedViewerInterectionObserverChangeOptions) {
		if (!this._domElement) {
			console.warn('cannot apply');
			return;
		}
		let {threshold, root, rootMargin, playPauseScene, onChange} = _options;
		if (threshold == null) {
			threshold = 0.01;
		}
		const observerOptions: IntersectionObserverInit = {
			root,
			rootMargin,
			threshold,
		};
		const onObserverChange: IntersectionObserverCallback = (entries, observer) => {
			entries.forEach((entry) => {
				const isVisible: boolean = entry.isIntersecting;
				this.setAutoRender(isVisible);
				if (playPauseScene) {
					if (isVisible) {
						this._scene.play();
					} else {
						this._scene.pause();
					}
				}
				if (onChange) {
					onChange(isVisible);
				}
			});
		};
		this.disableUpdateAutoRenderOnIntersectionChange();
		this._observer = new IntersectionObserver(onObserverChange, observerOptions);
		this._observer.observe(this._domElement);
	}
	/**
	 * Cancels the listening of the viewer's visibility.
	 *
	 */
	disableUpdateAutoRenderOnIntersectionChange() {
		if (!this._domElement) {
			return;
		}
		if (!this._observer) {
			return;
		}
		this._observer.unobserve(this._domElement);
	}

	//
	//
	// CALLBACKS
	//
	//
	// tick callbacks
	private _onBeforeTickCallbacksMap: ViewerCallbacksMap<ViewerTickCallback> | undefined;
	private _onAfterTickCallbacksMap: ViewerCallbacksMap<ViewerTickCallback> | undefined;
	protected _onBeforeTickCallbacks: Array<ViewerTickCallback> = [];
	protected _onAfterTickCallbacks: Array<ViewerTickCallback> = [];
	// render callbacks
	private _onBeforeRenderCallbacksMap: ViewerCallbacksMap<ViewerRenderCallback> | undefined;
	private _onAfterRenderCallbacksMap: ViewerCallbacksMap<ViewerRenderCallback> | undefined;
	protected _onBeforeRenderCallbacks: Array<ViewerRenderCallback> = [];
	protected _onAfterRenderCallbacks: Array<ViewerRenderCallback> = [];

	// onBeforeTick
	/**
	 * registers a BeforeTick callback. BeforeTick callbacks are run before updating the frame (and therefore before any time dependent node has changed)
	 *
	 */
	registerOnBeforeTick(callbackName: string, callback: ViewerTickCallback, options: BaseViewerCallbackOptions = {}) {
		this._registerCallback(callbackName, callback, this.registeredBeforeTickCallbacks(), options);
	}
	/**
	 * unregisters BeforeTick callback
	 *
	 */
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbacksMap);
	}
	/**
	 * Returns the list registered BeforeTick callback names
	 *
	 */
	registeredBeforeTickCallbacks() {
		return (this._onBeforeTickCallbacksMap = this._onBeforeTickCallbacksMap || new Map());
	}
	// onAfterTick
	/**
	 * registers AfterTick callback. AfterTick callbacks are run after updating the frame (and therefore after any time dependent node has changed)
	 *
	 */
	registerOnAfterTick(callbackName: string, callback: ViewerTickCallback, options: BaseViewerCallbackOptions = {}) {
		this._registerCallback(callbackName, callback, this.registeredAfterTickCallbacks(), options);
	}
	/**
	 * unregisters AfterTick callback
	 *
	 */
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbacksMap);
	}
	/**
	 * Returns the list registered AfterTick callback names
	 *
	 */
	registeredAfterTickCallbacks() {
		return (this._onAfterTickCallbacksMap = this._onAfterTickCallbacksMap || new Map());
	}
	// onBeforeRender
	/**
	 * registers a BeforeRender callback. BeforeRender callbacks are run before the frame is rendered
	 *
	 */
	registerOnBeforeRender(
		callbackName: string,
		callback: ViewerRenderCallback,
		options: BaseViewerCallbackOptions = {}
	) {
		this._registerCallback(callbackName, callback, this.registeredBeforeRenderCallbacks(), options);
	}
	/**
	 * unregisters BeforeRender callback
	 *
	 */
	unRegisterOnBeforeRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeRenderCallbacksMap);
	}
	/**
	 * Returns the list registered BeforeRender callback names
	 *
	 */
	registeredBeforeRenderCallbacks() {
		return (this._onBeforeRenderCallbacksMap = this._onBeforeRenderCallbacksMap || new Map());
	}
	// onAfterRender
	/**
	 * registers a AfterRender callback. AfterRender callbacks are run after the frame is rendered
	 *
	 */ registerOnAfterRender(
		callbackName: string,
		callback: ViewerRenderCallback,
		options: BaseViewerCallbackOptions = {}
	) {
		this._registerCallback(callbackName, callback, this.registeredAfterRenderCallbacks(), options);
	}
	/**
	 * unregisters AfterRender callback
	 *
	 */
	unRegisterOnAfterRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterRenderCallbacksMap);
	}
	/**
	 * Returns the list AfterRender BeforeRender callback names
	 *
	 */
	registeredAfterRenderCallbacks() {
		return (this._onAfterRenderCallbacksMap = this._onAfterRenderCallbacksMap || new Map());
	}
	private _registerCallback<C extends ViewerBaseCallback>(
		callbackName: string,
		callback: C,
		map: ViewerCallbacksMap<C>,
		options: BaseViewerCallbackOptions = {}
	) {
		if (map.has(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		map.set(callbackName, {callback, options});
		this._updateCallbacks();
	}
	private _unregisterCallback<C extends ViewerBaseCallback>(callbackName: string, map?: ViewerCallbacksMap<C>) {
		if (!map) {
			return;
		}
		const callbackContainer = map.get(callbackName);
		if (!callbackContainer) {
			return;
		}
		const options = callbackContainer.options;
		if (options.persistent == true) {
			return;
		}
		map.delete(callbackName);
		this._updateCallbacks();
	}
	private _updateCallbacks() {
		this._onBeforeTickCallbacks = [];
		this._onBeforeTickCallbacksMap?.forEach((callbackContainer) => {
			this._onBeforeTickCallbacks.push(callbackContainer.callback);
		});
		this._onAfterTickCallbacks = [];
		this._onAfterTickCallbacksMap?.forEach((callbackContainer) => {
			this._onAfterTickCallbacks.push(callbackContainer.callback);
		});
		this._onBeforeRenderCallbacks = [];
		this._onBeforeRenderCallbacksMap?.forEach((callbackContainer) => {
			this._onBeforeRenderCallbacks.push(callbackContainer.callback);
		});
		this._onAfterRenderCallbacks = [];
		this._onAfterRenderCallbacksMap?.forEach((callbackContainer) => {
			this._onAfterRenderCallbacks.push(callbackContainer.callback);
		});
	}
	private _runTickCallbacks(callbacks: ViewerTickCallback[], delta: number) {
		for (const callback of callbacks) {
			callback(delta);
		}
	}
	private _runRenderCallbacks(callbacks: ViewerRenderCallback[], delta: number, renderer: AbstractRenderer) {
		for (const callback of callbacks) {
			callback(delta, renderer);
		}
	}
	protected _runOnBeforeTickCallbacks(delta: number) {
		this._runTickCallbacks(this._onBeforeTickCallbacks, delta);
	}
	protected _runOnAfterTickCallbacks(delta: number) {
		this._runTickCallbacks(this._onAfterTickCallbacks, delta);
	}
	protected _runOnBeforeRenderCallbacks(delta: number, renderer: AbstractRenderer) {
		this._runRenderCallbacks(this._onBeforeRenderCallbacks, delta, renderer);
	}
	protected _runOnAfterRenderCallbacks(delta: number, renderer: AbstractRenderer) {
		this._runRenderCallbacks(this._onAfterRenderCallbacks, delta, renderer);
	}
}

export type BaseViewerType = TypedViewer<Camera>;
