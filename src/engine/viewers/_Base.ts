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
type onTimeTickHook = () => void;
type onRenderHook = () => void;

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
	container() {
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

	// private async _init_from_scene(camera_node: BaseCameraObjNodeType) {
	// 	// camera_node || this._scene.cameras_controller.masterCameraNode
	// 	await this.con_controller?.set_camera_node(camera_node);
	// 	// await this.update_picker_nodes(); // TODO: typescript
	// }
	// protected abstract _build(): void;
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
		this.container().classList.remove(HOVERED_CLASS_NAME);
	}
	setContainerClassHovered() {
		this.container().classList.add(HOVERED_CLASS_NAME);
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
		if (this._onBeforeTickCallbackNames?.includes(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		this._onBeforeTickCallbacks = this._onBeforeTickCallbacks || [];
		this._onBeforeTickCallbackNames = this._onBeforeTickCallbackNames || [];
		this._onBeforeTickCallbacks.push(callback);
		this._onBeforeTickCallbackNames.push(callbackName);
	}
	unRegisterOnBeforeTick(callbackName: string) {
		if (!this._onBeforeTickCallbackNames) {
			return;
		}
		if (!this._onBeforeTickCallbacks) {
			return;
		}
		const index = this._onBeforeTickCallbackNames.indexOf(callbackName);
		this._onBeforeTickCallbackNames.splice(index, 1);
		this._onBeforeTickCallbacks.splice(index, 1);
	}
	registeredBeforeTickCallbackNames() {
		return this._onBeforeTickCallbackNames;
	}
	registerOnAfterTick(callbackName: string, callback: onTimeTickHook) {
		if (this._onAfterTickCallbackNames?.includes(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		this._onAfterTickCallbacks = this._onAfterTickCallbacks || [];
		this._onAfterTickCallbackNames = this._onAfterTickCallbackNames || [];
		this._onAfterTickCallbacks.push(callback);
		this._onAfterTickCallbackNames.push(callbackName);
	}
	unRegisterOnAfterTick(callbackName: string) {
		if (!this._onAfterTickCallbackNames) {
			return;
		}
		if (!this._onAfterTickCallbacks) {
			return;
		}
		const index = this._onAfterTickCallbackNames.indexOf(callbackName);
		this._onAfterTickCallbackNames.splice(index, 1);
		this._onAfterTickCallbacks.splice(index, 1);
	}
	registeredAfterTickCallbackNames() {
		return this._onAfterTickCallbackNames;
	}
	registerOnBeforeRender(callbackName: string, callback: onRenderHook) {
		if (this._onBeforeRenderCallbackNames?.includes(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		this._onBeforeRenderCallbacks = this._onBeforeRenderCallbacks || [];
		this._onBeforeRenderCallbackNames = this._onBeforeRenderCallbackNames || [];
		this._onBeforeRenderCallbacks.push(callback);
		this._onBeforeRenderCallbackNames.push(callbackName);
	}
	unRegisterOnBeforeRender(callbackName: string) {
		if (!this._onBeforeRenderCallbackNames) {
			return;
		}
		if (!this._onBeforeRenderCallbacks) {
			return;
		}
		const index = this._onBeforeRenderCallbackNames.indexOf(callbackName);
		this._onBeforeRenderCallbackNames.splice(index, 1);
		this._onBeforeRenderCallbacks.splice(index, 1);
	}
	registeredBeforeRenderCallbackNames() {
		return this._onBeforeRenderCallbackNames;
	}
	registerOnAfterRender(callbackName: string, callback: onRenderHook) {
		if (this._onAfterRenderCallbackNames?.includes(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		this._onAfterRenderCallbacks = this._onAfterRenderCallbacks || [];
		this._onAfterRenderCallbackNames = this._onAfterRenderCallbackNames || [];
		this._onAfterRenderCallbacks.push(callback);
		this._onAfterRenderCallbackNames.push(callbackName);
	}
	unRegisterOnAfterRender(callbackName: string) {
		if (!this._onAfterRenderCallbackNames) {
			return;
		}
		if (!this._onAfterRenderCallbacks) {
			return;
		}
		const index = this._onAfterRenderCallbackNames.indexOf(callbackName);
		this._onAfterRenderCallbackNames.splice(index, 1);
		this._onAfterRenderCallbacks.splice(index, 1);
	}
	registeredAfterRenderCallbackNames() {
		return this._onAfterRenderCallbackNames;
	}
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
