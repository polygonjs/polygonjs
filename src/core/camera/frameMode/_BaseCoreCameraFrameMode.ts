import {Camera} from 'three';
import {isNumber} from '../../Type';
import {CameraAttribute} from '../CoreCamera';
import {CameraFrameMode, CAMERA_FRAME_MODES} from '../CoreCameraFrameMode';
import {coreObjectClassFactory} from '../../geometry/CoreObjectFactory';

export class BaseCoreCameraFrameMode {
	static frameMode(camera: Camera) {
		return this._getFrameMode(camera) || CameraFrameMode.DEFAULT;
	}
	static expectedAspectRatio(camera: Camera) {
		return coreObjectClassFactory(camera).attribValue(camera, CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO);
	}
	private static _getFrameMode(camera: Camera) {
		const frameModeAttribVal = coreObjectClassFactory(camera).attribValue(camera, CameraAttribute.FRAME_MODE);
		if (!frameModeAttribVal) {
			return;
		}
		if (!isNumber(frameModeAttribVal)) {
			return;
		}
		return CAMERA_FRAME_MODES[frameModeAttribVal];
	}
}
