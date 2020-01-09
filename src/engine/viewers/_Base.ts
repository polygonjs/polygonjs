import {Scene} from 'three/src/scenes/Scene';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {BaseCameraObjNode} from 'src/engine/nodes/obj/_BaseCamera';

// import {CameraMixin} from './concerns/Camera';
// import {Capturer} from './concerns/Capturer';
// import {ContainerClass} from './concerns/ContainerClass';
// import {Controls} from './concerns/Controls';
// import {PickerForViewer} from './concerns/Picker';

import {CamerasController} from './utils/CamerasController';
import {ControlsController} from './utils/ControlsController';
import {EventsController} from './utils/EventsController';
import {WebGLController} from './utils/WebglController';

// class AbstractViewer {}

const HOVERED_CLASS_NAME = 'hovered';

export abstract class BaseViewer {
	protected _display_scene: Scene;
	protected _canvas: HTMLCanvasElement;
	protected _active: boolean = false;

	get active() {
		return this._active;
	}
	activate() {
		this._active = true;
	}
	deactivate() {
		this._active = false;
	}

	protected _cameras_controller: CamerasController;
	get cameras_controller() {
		return (this._cameras_controller = this._cameras_controller || new CamerasController(this));
	}
	protected _controls_controller: ControlsController;
	get controls_controller() {
		return (this._controls_controller = this._controls_controller || new ControlsController(this));
	}
	protected _events_controller: EventsController;
	get events_controller() {
		return (this._events_controller = this._events_controller || new EventsController(this));
	}
	protected _webgl_controller: WebGLController;
	get webgl_controller() {
		return (this._webgl_controller = this._webgl_controller || new WebGLController(this));
	}

	constructor(protected _container: HTMLElement, protected _scene: PolyScene, camera_node: BaseCameraObjNode) {
		this._display_scene = this._scene.display_scene;
		this._init_from_scene(camera_node).then(() => {
			this._build();
		});
	}
	get container() {
		return this._container;
	}
	get scene() {
		return this._scene;
	}
	get canvas() {
		return this._canvas;
	}

	private async _init_from_scene(camera_node: BaseCameraObjNode) {
		this.cameras_controller.set_camera_node(camera_node || this._scene.cameras_controller.master_camera_node);
		// await this.update_picker_nodes(); // TODO: typescript
	}
	protected abstract _build(): void;

	// html container class
	reset_container_class() {
		this.container.classList.remove(HOVERED_CLASS_NAME);
	}
	set_container_class_hovered() {
		this.container.classList.add(HOVERED_CLASS_NAME);
	}
}
