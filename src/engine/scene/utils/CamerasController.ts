import {PolyScene} from '../PolyScene';
import {BaseCameraObjNodeType} from 'src/engine/nodes/obj/_BaseCamera';

export class CamerasController {
	constructor(private scene: PolyScene) {}

	_master_camera_node_path: string | null = null;

	set_master_camera_node_path(camera_node_path: string) {
		this._master_camera_node_path = camera_node_path;
	}
	get master_camera_node_path() {
		return this._master_camera_node_path;
	}
	get master_camera_node(): BaseCameraObjNodeType | null {
		if (this.master_camera_node_path) {
			const camera_node = this.scene.node(this.master_camera_node_path) as BaseCameraObjNodeType | null;
			return camera_node;
		} else {
			console.warn('master camera node not found');
			return this._find_any_camera();
		}
	}

	private _find_any_camera(): BaseCameraObjNodeType | null {
		const root = this.scene.root;
		return root.nodes_by_type('perspective_camera')[0] || root.nodes_by_type('orthographic_camera')[0];
	}
}
