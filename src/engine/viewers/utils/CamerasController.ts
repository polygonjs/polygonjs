// import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {BaseViewerType} from '../_Base';

export class ViewerCamerasController {
	// private _is_active: boolean = false;
	// private _camera_node: BaseThreejsCameraObjNodeType | undefined;
	// private _camera: Camera;

	private _size: Vector2 = new Vector2(100, 100);
	private _aspect: number = 1;

	constructor(private _viewer: BaseViewerType) {}

	cameraNode() {
		return this._viewer.cameraNode();
	}
	get size() {
		return this._size;
	}
	get aspect() {
		return this._aspect;
	}

	computeSizeAndAspect() {
		this._updateSize();
		this.cameraNode().scene().uniformsController.updateResolutionDependentUniformOwners(this._size);
		this._aspect = this._getAspect();
	}

	private _updateSize() {
		this._size.x = this._viewer.container().offsetWidth;
		this._size.y = this._viewer.container().offsetHeight;
	}
	private _getAspect(): number {
		return this._size.x / this._size.y;
	}

	updateCameraAspect() {
		this.cameraNode().setup_for_aspect_ratio(this._aspect);
	}

	async prepareCurrentCamera() {
		await this.cameraNode().compute(); // ensure the camera is cooked
		await this._updateFromCameraContainer(); //container, graph_node_id)
	}

	async _updateFromCameraContainer() {
		this.updateCameraAspect();
		await this._viewer.controlsController?.create_controls();
	}
}
