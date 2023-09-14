import {OrthographicCamera} from 'three';
import {OrthographicCameraAttribute, UpdateProjectionOptions} from '../CoreCamera';
import {CameraFrameMode} from '../CoreCameraFrameMode';
import {ORTHOGRAPHIC_CAMERA_DEFAULT} from '../CoreOrthographicCamera';
import {BaseCoreCameraFrameMode} from './_BaseCoreCameraFrameMode';
import {cameraSetViewOffset} from '../CoreCameraViewOffset';
import {coreObjectClassFactory} from '../../geometry/CoreObjectFactory';

interface CoreCameraOrthographicFrameModeOptions {
	camera: OrthographicCamera;
	mode: CameraFrameMode;
	size: number;
	aspect: number;
	expectedAspectRatio: number;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type BasicCoreCameraOrthographicFrameModeOptions = PartialBy<
	CoreCameraOrthographicFrameModeOptions,
	'expectedAspectRatio'
>;

interface UpdateOptions extends UpdateProjectionOptions {
	cameraWithAttributes?: OrthographicCamera;
}
OrthographicCamera;

export class CoreCameraOrthographicFrameMode {
	static updateCameraAspect(camera: OrthographicCamera, aspect: number, options?: UpdateOptions) {
		const cameraWithAttributes = options?.cameraWithAttributes || camera;
		const frameMode = BaseCoreCameraFrameMode.frameMode(cameraWithAttributes);
		const expectedAspectRatio = BaseCoreCameraFrameMode.expectedAspectRatio(cameraWithAttributes) as
			| number
			| undefined;
		const size = coreObjectClassFactory(cameraWithAttributes).attribValue(
			cameraWithAttributes,
			OrthographicCameraAttribute.SIZE
		) as number | undefined;
		if (size != null) {
			this._update({
				mode: frameMode,
				camera: camera,
				size: size,
				aspect: aspect,
				expectedAspectRatio,
			});
		}
		if (options && options.resolution) {
			cameraSetViewOffset(camera, options.resolution);
		}

		camera.updateProjectionMatrix();
	}

	private static _update(options: BasicCoreCameraOrthographicFrameModeOptions) {
		const mode = options.mode;

		if (mode == CameraFrameMode.DEFAULT || options.expectedAspectRatio == null) {
			this._adjustFOVFromModeDefault(options);
		} else {
			const {expectedAspectRatio} = options;
			if (mode == CameraFrameMode.COVER) {
				this._adjustFOVFromModeCover({...options, expectedAspectRatio});
			} else {
				this._adjustFOVFromModeContain({...options, expectedAspectRatio});
			}
		}

		// switch (mode) {
		// 	case CameraFrameMode.DEFAULT: {
		// 		return this._adjustFOVFromModeDefault(options);
		// 	}
		// 	case CameraFrameMode.COVER: {
		// 		return this._adjustFOVFromModeCover(options);
		// 	}
		// 	case CameraFrameMode.CONTAIN: {
		// 		return this._adjustFOVFromModeContain(options);
		// 	}
		// }
		// TypeAssert.unreachable(mode);
	}
	private static _adjustFOVFromModeDefault(options: BasicCoreCameraOrthographicFrameModeOptions) {
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
	private static _adjustFOVFromSize(size: number, options: BasicCoreCameraOrthographicFrameModeOptions) {
		const horizontalSize = size * options.aspect;
		const zoom = 1;
		options.camera.left = ORTHOGRAPHIC_CAMERA_DEFAULT.left * horizontalSize * zoom;
		options.camera.right = ORTHOGRAPHIC_CAMERA_DEFAULT.right * horizontalSize * zoom;
		options.camera.top = ORTHOGRAPHIC_CAMERA_DEFAULT.top * size * zoom;
		options.camera.bottom = ORTHOGRAPHIC_CAMERA_DEFAULT.bottom * size * zoom;
	}
}
