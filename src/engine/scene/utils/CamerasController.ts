import {PolyScene} from '../PolyScene';
import {BaseCameraObjNodeType} from '../../nodes/obj/_BaseCamera';

export class CamerasController {
	constructor(private scene: PolyScene) {}

	_masterCameraNodePath: string | null = null;

	setMasterCameraNodePath(camera_node_path: string) {
		this._masterCameraNodePath = camera_node_path;
	}
	masterCameraNodePath() {
		return this._masterCameraNodePath;
	}
	masterCameraNode(): BaseCameraObjNodeType | null {
		if (this.masterCameraNodePath) {
			const path = this.masterCameraNodePath();
			if (!path) {
				return this._find_any_camera();
			}
			const camera_node = this.scene.node(path) as BaseCameraObjNodeType | null;
			return camera_node;
		} else {
			console.warn('master camera node not found');
			return this._find_any_camera();
		}
	}

	private _find_any_camera(): BaseCameraObjNodeType | null {
		const root = this.scene.root;
		return root.nodesByType('perspectiveCamera')[0] || root.nodesByType('orthographicCamera')[0];
	}
}
