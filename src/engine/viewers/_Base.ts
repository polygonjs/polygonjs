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
	get scene() {
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
	get id() {
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
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
