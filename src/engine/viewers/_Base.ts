import {Scene} from 'three/src/scenes/Scene'
import {PolyScene} from 'src/engine/scene/PolyScene'
import {BaseCamera} from 'src/engine/nodes/objects/_BaseCamera'

import {CameraMixin} from './concerns/Camera'
import {Capturer} from './concerns/Capturer'
import {ContainerClass} from './concerns/ContainerClass'
import {Controls} from './concerns/Controls'
import {EventMouse} from './concerns/EventMouse'
import {PickerForViewer} from './concerns/Picker'
import {WebglContext} from './concerns/WebglContext'

class AbstractViewer {}

export abstract class BaseViewer extends CameraMixin(
	Capturer(ContainerClass(Controls(EventMouse(PickerForViewer(WebglContext(AbstractViewer))))))
) {
	private _display_scene: Scene

	constructor(protected _element: HTMLElement, protected _scene: PolyScene, camera_node: BaseCamera) {
		super()
		this._display_scene = this._scene.display_scene()
		// COMMENT NEXT LINE WHEN EXPORTING
		this._init_from_scene(camera_node).then(() => {
			this._build()
		})
	}
	private async _init_from_scene(camera_node: BaseCamera) {
		this.set_camera_node(camera_node || this._scene.master_camera_node())
		await this.update_picker_nodes()
	}
	protected abstract _build(): void
}
