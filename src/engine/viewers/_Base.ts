import {PolyScene} from '../scene/PolyScene';
import {BaseCameraObjNodeType} from '../nodes/obj/_BaseCamera';

// import {CameraMixin} from './concerns/Camera';
// import {Capturer} from './concerns/Capturer';
// import {ContainerClass} from './concerns/ContainerClass';
// import {Controls} from './concerns/Controls';
// import {PickerForViewer} from './concerns/Picker';

import {ViewerCamerasController} from './utils/CamerasController';
import {ViewerControlsController} from './utils/ControlsController';
import {ViewerEventsController} from './utils/EventsController';
import {WebGLController} from './utils/WebglController';
import {ThreejsCameraControlsController} from '../nodes/obj/utils/cameras/ControlsController';

// class AbstractViewer {}

const HOVERED_CLASS_NAME = 'hovered';
type onTimeTickHook = (delta: number) => void;
type onRenderHook = (delta: number) => void;
type ViewerHook = onTimeTickHook | onRenderHook;

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
	private _onBeforeTickCallbackNames: string[] | undefined;
	private _onAfterTickCallbackNames: string[] | undefined;
	protected _onBeforeTickCallbacks: onTimeTickHook[] | undefined;
	protected _onAfterTickCallbacks: onTimeTickHook[] | undefined;
	// render callbacks
	private _onBeforeRenderCallbackNames: string[] | undefined;
	private _onAfterRenderCallbackNames: string[] | undefined;
	protected _onBeforeRenderCallbacks: onRenderHook[] | undefined;
	protected _onAfterRenderCallbacks: onRenderHook[] | undefined;

	registerOnBeforeTick(callbackName: string, callback: onTimeTickHook) {
		this._onBeforeTickCallbackNames = this._onBeforeTickCallbackNames || [];
		this._onBeforeTickCallbacks = this._onBeforeTickCallbacks || [];
		this._registerCallback(callbackName, callback, this._onBeforeTickCallbackNames, this._onBeforeTickCallbacks);
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbackNames, this._onBeforeTickCallbacks);
	}
	registeredBeforeTickCallbackNames() {
		return this._onBeforeTickCallbackNames;
	}
	registerOnAfterTick(callbackName: string, callback: onTimeTickHook) {
		this._onAfterTickCallbacks = this._onAfterTickCallbacks || [];
		this._onAfterTickCallbackNames = this._onAfterTickCallbackNames || [];
		this._registerCallback(callbackName, callback, this._onAfterTickCallbackNames, this._onAfterTickCallbacks);
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbackNames, this._onAfterTickCallbacks);
	}
	registeredAfterTickCallbackNames() {
		return this._onAfterTickCallbackNames;
	}
	registerOnBeforeRender(callbackName: string, callback: onRenderHook) {
		this._onBeforeRenderCallbackNames = this._onBeforeRenderCallbackNames || [];
		this._onBeforeRenderCallbacks = this._onBeforeRenderCallbacks || [];
		this._registerCallback(
			callbackName,
			callback,
			this._onBeforeRenderCallbackNames,
			this._onBeforeRenderCallbacks
		);
	}
	unRegisterOnBeforeRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeRenderCallbackNames, this._onBeforeRenderCallbacks);
	}
	registeredBeforeRenderCallbackNames() {
		return this._onBeforeRenderCallbackNames;
	}
	registerOnAfterRender(callbackName: string, callback: onRenderHook) {
		this._onAfterRenderCallbackNames = this._onAfterRenderCallbackNames || [];
		this._onAfterRenderCallbacks = this._onAfterRenderCallbacks || [];
		this._registerCallback(callbackName, callback, this._onAfterRenderCallbackNames, this._onAfterRenderCallbacks);
	}
	unRegisterOnAfterRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterRenderCallbackNames, this._onAfterRenderCallbacks);
	}
	registeredAfterRenderCallbackNames() {
		return this._onAfterRenderCallbackNames;
	}
	private _registerCallback<C extends ViewerHook>(
		callbackName: string,
		callback: C,
		names: string[],
		callbacks: C[]
	) {
		if (names?.includes(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		callbacks.push(callback);
		names.push(callbackName);
	}
	private _unregisterCallback(callbackName: string, names?: string[], hooks?: ViewerHook[]) {
		if (!(names && hooks)) {
			return;
		}
		const index = names.indexOf(callbackName);
		names.splice(index, 1);
		hooks.splice(index, 1);
	}
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
