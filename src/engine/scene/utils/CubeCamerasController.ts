import {PolyScene} from 'src/engine/scene/PolyScene';
import {CubeCameraObjNode} from 'src/engine/nodes/obj/CubeCamera';

export class CubeCamerasController {
	constructor(private _scene: PolyScene) {}

	on_all_objects_loaded() {
		const cube_camera_nodes = (<unknown>(
			this._scene.root.children_controller.nodes_by_type('cube_camera')
		)) as CubeCameraObjNode[];
		for (let cube_camera_node of cube_camera_nodes) {
			cube_camera_node.render();
		}
	}
}
