import {Scene} from 'three/src/scenes/Scene';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {BaseCamera} from 'src/engine/nodes/obj/_BaseCamera';

import {CameraMixin} from './concerns/Camera';
// import {Capturer} from './concerns/Capturer';
// import {ContainerClass} from './concerns/ContainerClass';
import {Controls} from './concerns/Controls';
import {PickerForViewer} from './concerns/Picker';
import {WebglContext} from './concerns/WebglContext';
import {EventsController} from './utils/EventsController';

class AbstractViewer {}

const HOVERED_CLASS_NAME = 'hovered';

export abstract class BaseViewer extends CameraMixin(Controls(PickerForViewer(WebglContext(AbstractViewer)))) {
	protected _display_scene: Scene;
	protected _canvas: HTMLCanvasElement;

	protected _events_controller: EventsController;
	get events_controller() {
		return (this._events_controller = this._events_controller || new EventsController(this));
	}

	constructor(protected _container: HTMLElement, protected _scene: PolyScene, camera_node: BaseCamera) {
		super();
		this._display_scene = this._scene.display_scene();
		this._init_from_scene(camera_node).then(() => {
			this._build();
		});
	}
	get scene() {
		return this._scene;
	}
	get canvas() {
		return this._canvas;
	}

	private async _init_from_scene(camera_node: BaseCamera) {
		this.set_camera_node(camera_node || this._scene.master_camera_node());
		await this.update_picker_nodes();
	}
	protected abstract _build(): void;

	// html container class
	reset_container_class() {
		this.self._element.classList.remove(HOVERED_CLASS_NAME);
	}
	set_container_class_hovered() {
		this.self._element.classList.add(HOVERED_CLASS_NAME);
	}
}
