import {Raycaster, Vector2, Vector3, Matrix4} from 'three';
import {MapboxPerspectiveCamera} from './MapboxPerspectiveCamera';

export class MapboxRaycaster extends Raycaster {
	private _inverseProjMat = new Matrix4();
	private _camPos = new Vector3();
	private _mousePos = new Vector3();
	private _viewDir = new Vector3();

	override setFromCamera(mouse: Vector2, camera: MapboxPerspectiveCamera) {
		this._inverseProjMat.copy(camera.projectionMatrix);
		this._inverseProjMat.invert();
		this._camPos.set(0, 0, 0);
		this._camPos.applyMatrix4(this._inverseProjMat);
		this._mousePos.set(mouse.x, mouse.y, 1);
		this._mousePos.applyMatrix4(this._inverseProjMat);
		this._viewDir.copy(this._mousePos).sub(this._camPos).normalize();
		this.set(this._camPos, this._viewDir);
	}
}
