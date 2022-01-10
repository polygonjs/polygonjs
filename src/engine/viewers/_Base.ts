import {BaseCameraObjNodeType} from '../nodes/obj/_BaseCamera';
import {ViewerCamerasController} from './utils/CamerasController';
import {ViewerControlsController} from './utils/ControlsController';
import {ViewerEventsController} from './utils/EventsController';
import {WebGLController} from './utils/WebglController';
import {ThreejsCameraControlsController} from '../nodes/obj/utils/cameras/ControlsController';
import {Object3D} from 'three/src/core/Object3D';
import {PolyScene} from '../scene/PolyScene';
import {ViewerAudioController} from './utils/AudioController';

const HOVERED_CLASS_NAME = 'hovered';
type ViewerCallback = (delta: number) => void;
type CallbacksMap = Map<string, ViewerCallback>;

export abstract class TypedViewer<C extends BaseCameraObjNodeType> {
	// protected _display_scene: Scene;
	// protected _canvas: HTMLCanvasElement | undefined;
	protected _domElement: HTMLElement | undefined;
	protected _active: boolean = false;
	private static _next_viewer_id = 0;
	private _id: Readonly<number>;
	protected _renderObjectOverride: Object3D | undefined;
	protected _scene: PolyScene;
	protected _canvas: HTMLCanvasElement | undefined;
	constructor(protected _cameraNode: C) {
		this._id = TypedViewer._next_viewer_id++;
		this._scene = this._cameraNode.scene();
	}
	mount(element: HTMLElement) {
		this._domElement = element;
	}
	unmount() {
		if (!this._domElement) {
			return;
		}
		let childElement: Element | undefined;
		while ((childElement = this._domElement.children[0])) {
			this._domElement.removeChild(childElement);
		}
	}
	protected _canvasIdPrefix() {
		return 'TypedViewer';
	}
	private _createCanvas() {
		const canvas = document.createElement('canvas');
		canvas.id = `${this._canvasIdPrefix()}_${this._id}`;
		canvas.style.display = 'block';
		canvas.style.outline = 'none';
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

	protected _cameras_controller: ViewerCamerasController | undefined;
	get camerasController(): ViewerCamerasController {
		return (this._cameras_controller = this._cameras_controller || new ViewerCamerasController(this));
	}
	protected _controls_controller: ViewerControlsController | undefined;
	get controlsController() {
		return this._controls_controller;
	}
	protected _events_controller: ViewerEventsController | undefined;
	get eventsController(): ViewerEventsController {
		return (this._events_controller = this._events_controller || new ViewerEventsController(this));
	}
	protected _webgl_controller: WebGLController | undefined;
	get webglController(): WebGLController {
		return (this._webgl_controller = this._webgl_controller || new WebGLController(this));
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
	get cameraControlsController(): ThreejsCameraControlsController | undefined {
		return undefined;
	}
	id() {
		return this._id;
	}

	dispose() {
		this._scene.viewersRegister.unregisterViewer(this);
		this.eventsController.dispose();
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

	//
	//
	// CALLBACKS
	//
	//
	// tick callbacks
	private _onBeforeTickCallbacksMap: CallbacksMap | undefined;
	private _onAfterTickCallbacksMap: CallbacksMap | undefined;
	protected _onBeforeTickCallbacks: Array<ViewerCallback> = [];
	protected _onAfterTickCallbacks: Array<ViewerCallback> = [];
	// render callbacks
	private _onBeforeRenderCallbacksMap: CallbacksMap | undefined;
	private _onAfterRenderCallbacksMap: CallbacksMap | undefined;
	protected _onBeforeRenderCallbacks: Array<ViewerCallback> = [];
	protected _onAfterRenderCallbacks: Array<ViewerCallback> = [];

	registerOnBeforeTick(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredBeforeTickCallbacks());
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbacksMap);
	}
	registeredBeforeTickCallbacks() {
		return (this._onBeforeTickCallbacksMap = this._onBeforeTickCallbacksMap || new Map());
	}
	registerOnAfterTick(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredAfterTickCallbacks());
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbacksMap);
	}
	registeredAfterTickCallbacks() {
		return (this._onAfterTickCallbacksMap = this._onAfterTickCallbacksMap || new Map());
	}
	registerOnBeforeRender(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredBeforeRenderCallbacks());
	}
	unRegisterOnBeforeRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeRenderCallbacksMap);
	}
	registeredBeforeRenderCallbacks() {
		return (this._onBeforeRenderCallbacksMap = this._onBeforeRenderCallbacksMap || new Map());
	}
	registerOnAfterRender(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredAfterRenderCallbacks());
	}
	unRegisterOnAfterRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterRenderCallbacksMap);
	}
	registeredAfterRenderCallbacks() {
		return (this._onAfterRenderCallbacksMap = this._onAfterRenderCallbacksMap || new Map());
	}
	private _registerCallback<C extends ViewerCallback>(callbackName: string, callback: C, map: CallbacksMap) {
		if (map.has(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		map.set(callbackName, callback);
		this._updateCallbacks();
	}
	private _unregisterCallback(callbackName: string, map?: CallbacksMap) {
		if (!map) {
			return;
		}
		map.delete(callbackName);
		this._updateCallbacks();
	}
	private _updateCallbacks() {
		this._onBeforeTickCallbacks = [];
		this._onBeforeTickCallbacksMap?.forEach((callback) => {
			this._onBeforeTickCallbacks.push(callback);
		});
		this._onAfterTickCallbacks = [];
		this._onAfterTickCallbacksMap?.forEach((callback) => {
			this._onAfterTickCallbacks.push(callback);
		});
		this._onBeforeRenderCallbacks = [];
		this._onBeforeRenderCallbacksMap?.forEach((callback) => {
			this._onBeforeRenderCallbacks.push(callback);
		});
		this._onAfterRenderCallbacks = [];
		this._onAfterRenderCallbacksMap?.forEach((callback) => {
			this._onAfterRenderCallbacks.push(callback);
		});
	}
	private _runCallbacks(callbacks: ViewerCallback[], delta: number) {
		for (const callback of callbacks) {
			callback(delta);
		}
	}
	protected _runOnBeforeTickCallbacks(delta: number) {
		this._runCallbacks(this._onBeforeTickCallbacks, delta);
	}
	protected _runOnAfterTickCallbacks(delta: number) {
		this._runCallbacks(this._onAfterTickCallbacks, delta);
	}
	protected _runOnBeforeRenderCallbacks(delta: number) {
		this._runCallbacks(this._onBeforeRenderCallbacks, delta);
	}
	protected _runOnAfterRenderCallbacks(delta: number) {
		this._runCallbacks(this._onAfterRenderCallbacks, delta);
	}
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
