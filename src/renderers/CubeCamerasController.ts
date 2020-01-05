import {PolyScene} from 'src/engine/scene/PolyScene'

export class CubeCamerasController {
	constructor(private _scene: PolyScene) {}

	on_all_objects_loaded() {
		const cube_camera_nodes = this._scene
			.root()
			.nodes_by_type('cube_camera')
		for (let cube_camera_node of cube_camera_nodes) {
			cube_camera_node.render()
		}
	}
}
