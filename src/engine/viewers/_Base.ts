import {BaseCameraObjNodeType} from '../nodes/obj/_BaseCamera';
import {ViewerCamerasController} from './utils/CamerasController';
import {ViewerControlsController} from './utils/ControlsController';
import {ViewerEventsController} from './utils/EventsController';

import {ViewerWebGLController} from './utils/WebglController';
import {ThreejsCameraControlsController} from '../nodes/obj/utils/cameras/ControlsController';
import {Object3D} from 'three/src/core/Object3D';
import {PolyScene} from '../scene/PolyScene';
import {ViewerAudioController} from './utils/AudioController';
import {Poly, PolyEngine} from '../Poly';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';

const HOVERED_CLASS_NAME = 'hovered';

type ViewerTickCallback = (delta: number) => void;
type ViewerRenderCallback = (delta: number, renderer: WebGLRenderer) => void;
type ViewerBaseCallback = ViewerTickCallback | ViewerRenderCallback;
interface ViewerCallbackOptions {
	persistent?: boolean;
}
interface ViewerCallbackContainer<T extends ViewerBaseCallback> {
	callback: T;
	options: ViewerCallbackOptions;
}
type ViewerCallbacksMap<T extends ViewerBaseCallback> = Map<string, ViewerCallbackContainer<T>>;
export interface HTMLElementWithViewer<C extends BaseCameraObjNodeType> extends HTMLElement {
	scene: PolyScene;
	viewer: TypedViewer<C>;
	Poly: PolyEngine;
}

export abstract class TypedViewer<C extends BaseCameraObjNodeType> {
	// protected _display_scene: Scene;
	// protected _canvas: HTMLCanvasElement | undefined;
	protected _domElement: HTMLElementWithViewer<C> | undefined;
	protected _active: boolean = false;
	private static _nextViewerId = 0;
	private _id: Readonly<number>;
	protected _renderObjectOverride: Object3D | undefined;
	protected _scene: PolyScene;
	protected _canvas: HTMLCanvasElement | undefined;
	constructor(protected _cameraNode: C) {
		this._id = TypedViewer._nextViewerId++;
		this._scene = this._cameraNode.scene();
	}

	protected _mounted = false;
	mount(element: HTMLElement) {
		this._domElement = element as HTMLElementWithViewer<C>;
		this._domElement.viewer = this;
		this._domElement.scene = this._cameraNode.scene();
		this._domElement.Poly = Poly;
		this._mounted = true;
	}
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

		this._mounted = false;
	}
	protected _canvasIdPrefix() {
		return 'TypedViewer';
	}
	private _createCanvas() {
		const canvas = document.createElement('canvas');
		canvas.id = `${this._canvasIdPrefix()}_${this._id}`;
		canvas.style.display = 'block';
		canvas.style.outline = 'none';
		// we add 100% to the width and height
		// to make it easy for the canvas to not grow larger
		// than its container, without requiring css to enforce this
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		return canvas;
	}
	canvas() {
		return (this._canvas = this._canvas || this._createCanvas());
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
	protected _controlsController: ViewerControlsController | undefined;
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

	domElement() {
		return this._domElement;
	}
	scene() {
		return this._scene;
	}

	cameraNode() {
		return this._cameraNode;
	}
	cameraControlsController(): ThreejsCameraControlsController | undefined {
		return undefined;
	}
	id() {
		return this._id;
	}

	dispose() {
		this._scene.viewersRegister.unregisterViewer(this);
		this.eventsController().dispose();
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
	registerOnBeforeTick(callbackName: string, callback: ViewerTickCallback, options: ViewerCallbackOptions = {}) {
		this._registerCallback(callbackName, callback, this.registeredBeforeTickCallbacks(), options);
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbacksMap);
	}
	registeredBeforeTickCallbacks() {
		return (this._onBeforeTickCallbacksMap = this._onBeforeTickCallbacksMap || new Map());
	}
	// onAfterTick
	registerOnAfterTick(callbackName: string, callback: ViewerTickCallback, options: ViewerCallbackOptions = {}) {
		this._registerCallback(callbackName, callback, this.registeredAfterTickCallbacks(), options);
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbacksMap);
	}
	registeredAfterTickCallbacks() {
		return (this._onAfterTickCallbacksMap = this._onAfterTickCallbacksMap || new Map());
	}
	// onBeforeRender
	registerOnBeforeRender(callbackName: string, callback: ViewerRenderCallback, options: ViewerCallbackOptions = {}) {
		this._registerCallback(callbackName, callback, this.registeredBeforeRenderCallbacks(), options);
	}
	unRegisterOnBeforeRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeRenderCallbacksMap);
	}
	registeredBeforeRenderCallbacks() {
		return (this._onBeforeRenderCallbacksMap = this._onBeforeRenderCallbacksMap || new Map());
	}
	// onAfterRender
	registerOnAfterRender(callbackName: string, callback: ViewerRenderCallback, options: ViewerCallbackOptions = {}) {
		this._registerCallback(callbackName, callback, this.registeredAfterRenderCallbacks(), options);
	}
	unRegisterOnAfterRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterRenderCallbacksMap);
	}
	registeredAfterRenderCallbacks() {
		return (this._onAfterRenderCallbacksMap = this._onAfterRenderCallbacksMap || new Map());
	}
	private _registerCallback<C extends ViewerBaseCallback>(
		callbackName: string,
		callback: C,
		map: ViewerCallbacksMap<C>,
		options: ViewerCallbackOptions = {}
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
	private _runRenderCallbacks(callbacks: ViewerRenderCallback[], delta: number, renderer: WebGLRenderer) {
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
	protected _runOnBeforeRenderCallbacks(delta: number, renderer: WebGLRenderer) {
		this._runRenderCallbacks(this._onBeforeRenderCallbacks, delta, renderer);
	}
	protected _runOnAfterRenderCallbacks(delta: number, renderer: WebGLRenderer) {
		this._runRenderCallbacks(this._onAfterRenderCallbacks, delta, renderer);
	}
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
