import {Camera} from 'three';
import {CoreObject} from '../../geometry/Object';
import {CoreType} from '../../Type';
import {CameraAttribute} from '../CoreCamera';
import {CameraFrameMode, CAMERA_FRAME_MODES} from '../CoreCameraFrameMode';

export class BaseCoreCameraFrameMode {
	static frameMode(camera: Camera) {
		return this._getFrameMode(camera) || CameraFrameMode.DEFAULT;
	}
	static expectedAspectRatio(camera: Camera) {
		return CoreObject.attribValue(camera, CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO);
	}
	private static _getFrameMode(camera: Camera) {
		const frameModeAttribVal = CoreObject.attribValue(camera, CameraAttribute.FRAME_MODE);
		if (!frameModeAttribVal) {
			return;
		}
		if (!CoreType.isNumber(frameModeAttribVal)) {
			return;
		}
		return CAMERA_FRAME_MODES[frameModeAttribVal];
	}
}
