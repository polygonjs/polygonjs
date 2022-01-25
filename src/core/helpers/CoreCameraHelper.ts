import {CameraHelper} from './CameraHelper';
export class CoreCameraHelper extends CameraHelper {
	override clone(recursive?: boolean): this {
		return new CameraHelper(this.camera).copy(this, recursive) as this;
	}
}
