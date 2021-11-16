import {PolyScene} from '../scene/PolyScene';
import {BaseCameraObjNodeType} from '../nodes/obj/_BaseCamera';

import {ViewerCamerasController} from './utils/CamerasController';
import {ViewerControlsController} from './utils/ControlsController';
import {ViewerEventsController} from './utils/EventsController';
import {WebGLController} from './utils/WebglController';
import {ThreejsCameraControlsController} from '../nodes/obj/utils/cameras/ControlsController';

const HOVERED_CLASS_NAME = 'hovered';
type ViewerHook = (delta: number) => void;
type CallbacksMap = Map<string, ViewerHook>;

export abstract class TypedViewer<C extends BaseCameraObjNodeType> {
	// protected _display_scene: Scene;
	protected _canvas: HTMLCanvasElement | undefined;
	protected _active: boolean = false;
	private static _next_viewer_id = 0;
	private _id: Readonly<number>;

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

	constructor(protected _container: HTMLElement, protected _scene: PolyScene, protected _camera_node: C) {
		this._id = TypedViewer._next_viewer_id++;
		this._scene.viewersRegister.registerViewer(this);
	}
	domElement() {
		return this._container;
	}
	scene() {
		return this._scene;
	}
	canvas() {
		return this._canvas;
	}
	cameraNode() {
		return this._camera_node;
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
		let child: Element;
		while ((child = this._container.children[0])) {
			this._container.removeChild(child);
		}
	}

	// html container class
	resetContainerClass() {
		this.domElement().classList.remove(HOVERED_CLASS_NAME);
	}
	setContainerClassHovered() {
		this.domElement().classList.add(HOVERED_CLASS_NAME);
	}

	//
	//
	// CALLBACKS
	//
	//
	// tick callbacks
	protected _onBeforeTickCallbacks: CallbacksMap | undefined;
	protected _onAfterTickCallbacks: CallbacksMap | undefined;
	// render callbacks
	protected _onBeforeRenderCallbacks: CallbacksMap | undefined;
	protected _onAfterRenderCallbacks: CallbacksMap | undefined;

	registerOnBeforeTick(callbackName: string, callback: ViewerHook) {
		this._registerCallback(callbackName, callback, this.registeredBeforeTickCallbacks());
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbacks);
	}
	registeredBeforeTickCallbacks() {
		return (this._onBeforeTickCallbacks = this._onBeforeTickCallbacks || new Map());
	}
	registerOnAfterTick(callbackName: string, callback: ViewerHook) {
		this._registerCallback(callbackName, callback, this.registeredAfterTickCallbacks());
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbacks);
	}
	registeredAfterTickCallbacks() {
		return (this._onAfterTickCallbacks = this._onAfterTickCallbacks || new Map());
	}
	registerOnBeforeRender(callbackName: string, callback: ViewerHook) {
		this._registerCallback(callbackName, callback, this.registeredBeforeRenderCallbacks());
	}
	unRegisterOnBeforeRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeRenderCallbacks);
	}
	registeredBeforeRenderCallbacks() {
		return (this._onBeforeRenderCallbacks = this._onBeforeRenderCallbacks || new Map());
	}
	registerOnAfterRender(callbackName: string, callback: ViewerHook) {
		this._registerCallback(callbackName, callback, this.registeredAfterRenderCallbacks());
	}
	unRegisterOnAfterRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterRenderCallbacks);
	}
	registeredAfterRenderCallbacks() {
		return (this._onAfterRenderCallbacks = this._onAfterRenderCallbacks || new Map());
	}
	private _registerCallback<C extends ViewerHook>(callbackName: string, callback: C, map: CallbacksMap) {
		if (map.has(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		map.set(callbackName, callback);
	}
	private _unregisterCallback(callbackName: string, map?: CallbacksMap) {
		if (!map) {
			return;
		}
		map.delete(callbackName);
	}
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
