// import {Camera} from 'three';
import {Vector2} from 'three';
import {BaseViewerType} from '../_Base';

export class ViewerCamerasController {
	// private _is_active: boolean = false;
	// private _camera_node: BaseThreejsCameraObjNodeType | undefined;
	// private _camera: Camera;

	private _size: Vector2 = new Vector2(100, 100);
	private _aspect: number = 1;

	constructor(private _viewer: BaseViewerType) {}

	camera() {
		return this._viewer.camera();
	}
	get size() {
		return this._size;
	}
	get aspect() {
		return this._aspect;
	}

	computeSizeAndAspect(pixelRatio: number) {
		this._updateSize();
		this._viewer.scene().uniformsController.updateResolution(this._size, pixelRatio);
		this._aspect = this._getAspect();
	}

	private _updateSize() {
		this._size.x = this._viewer.domElement()?.offsetWidth || 0;
		this._size.y = this._viewer.domElement()?.offsetHeight || 0;
	}
	private _getAspect(): number {
		return this._size.x / this._size.y;
	}

	updateCameraAspect() {
		this._viewer.updateCameraAspect(this._aspect);
		// this.cameraNode().setupForAspectRatio(this._aspect);
	}

	async prepareCurrentCamera() {
		//await this.cameraNode().compute(); // ensure the camera is cooked
		await this._updateFromCameraContainer(); //container, graph_node_id)
	}

	async _updateFromCameraContainer() {
		this.updateCameraAspect();
		// await this._viewer.controlsController()?.create_controls();
	}
}
