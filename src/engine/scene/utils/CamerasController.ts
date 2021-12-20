import {PolyScene} from '../PolyScene';
import {BaseCameraObjNodeType} from '../../nodes/obj/_BaseCamera';

export class CamerasController {
	constructor(private scene: PolyScene) {}

	_mainCameraNodePath: string | null = null;

	setMainCameraNodePath(camera_node_path: string) {
		this._mainCameraNodePath = camera_node_path;
	}
	mainCameraNodePath() {
		return this._mainCameraNodePath;
	}
	mainCameraNode(): BaseCameraObjNodeType | null {
		if (this.mainCameraNodePath) {
			const path = this.mainCameraNodePath();
			if (!path) {
				return this._findAnyCamera();
			}
			const cameraNode = this.scene.node(path) as BaseCameraObjNodeType | null;
			return cameraNode;
		} else {
			console.warn('main cameraNode not found');
			return this._findAnyCamera();
		}
	}

	private _findAnyCamera(): BaseCameraObjNodeType | null {
		const root = this.scene.root();
		return root.nodesByType('perspectiveCamera')[0] || root.nodesByType('orthographicCamera')[0];
	}
}
