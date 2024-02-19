import {Vector2} from 'three';
import {BaseViewerType} from '../_Base';

export class ViewerCamerasController {
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
		this._viewer.updateCameraAspect(this._aspect, this._size);
	}

	async prepareCurrentCamera() {
		await this._updateFromCameraContainer();
	}

	async _updateFromCameraContainer() {
		this.updateCameraAspect();
	}
}
