import {OrthographicCamera} from 'three';
import {TypeAssert} from '../../../engine/poly/Assert';
import {CoreObject} from '../../geometry/Object';
import {OrthographicCameraAttribute} from '../CoreCamera';
import {CameraFrameMode} from '../CoreCameraFrameMode';
import {ORTHOGRAPHIC_CAMERA_DEFAULT} from '../CoreOrthographicCamera';
import {BaseCoreCameraFrameMode} from './_BaseCoreCameraFrameMode';

interface CoreCameraOrthographicFrameModeOptions {
	camera: OrthographicCamera;
	mode: CameraFrameMode;
	size: number;
	aspect: number;
	expectedAspectRatio: number;
}

export class CoreCameraOrthographicFrameMode {
	static updateCameraAspect(camera: OrthographicCamera, aspect: number) {
		const frameMode = BaseCoreCameraFrameMode.frameMode(camera);
		const expectedAspectRatio = BaseCoreCameraFrameMode.expectedAspectRatio(camera) as number | undefined;
		const size = CoreObject.attribValue(camera, OrthographicCameraAttribute.SIZE) as number | undefined;
		if (size != null && expectedAspectRatio != null) {
			this._update({
				mode: frameMode,
				camera: camera,
				size: size,
				aspect: aspect,
				expectedAspectRatio: expectedAspectRatio,
			});
		}

		camera.updateProjectionMatrix();
	}

	private static _update(options: CoreCameraOrthographicFrameModeOptions) {
		const mode = options.mode;
		switch (mode) {
			case CameraFrameMode.DEFAULT: {
				return this._adjustFOVFromModeDefault(options);
			}
			case CameraFrameMode.COVER: {
				return this._adjustFOVFromModeCover(options);
			}
			case CameraFrameMode.CONTAIN: {
				return this._adjustFOVFromModeContain(options);
			}
		}
		TypeAssert.unreachable(mode);
	}
	private static _adjustFOVFromModeDefault(options: CoreCameraOrthographicFrameModeOptions) {
		this._adjustFOVFromSize(options.size || 1, options);
	}
	private static _adjustFOVFromModeCover(options: CoreCameraOrthographicFrameModeOptions) {
		const size = options.size || 1;
		if (options.aspect > options.expectedAspectRatio) {
			// window too large
			this._adjustFOVFromSize((options.expectedAspectRatio * size) / options.aspect, options);
		} else {
			// window too narrow
			this._adjustFOVFromSize(size, options);
		}
	}

	private static _adjustFOVFromModeContain(options: CoreCameraOrthographicFrameModeOptions) {
		const size = options.size || 1;
		if (options.aspect > options.expectedAspectRatio) {
			// window too large
			this._adjustFOVFromSize(size, options);
		} else {
			// window too narrow
			this._adjustFOVFromSize((options.expectedAspectRatio * size) / options.aspect, options);
		}
	}
	private static _adjustFOVFromSize(size: number, options: CoreCameraOrthographicFrameModeOptions) {
		const horizontalSize = size * options.aspect;
		const zoom = 1;
		options.camera.left = ORTHOGRAPHIC_CAMERA_DEFAULT.left * horizontalSize * zoom;
		options.camera.right = ORTHOGRAPHIC_CAMERA_DEFAULT.right * horizontalSize * zoom;
		options.camera.top = ORTHOGRAPHIC_CAMERA_DEFAULT.top * size * zoom;
		options.camera.bottom = ORTHOGRAPHIC_CAMERA_DEFAULT.bottom * size * zoom;
	}
}
