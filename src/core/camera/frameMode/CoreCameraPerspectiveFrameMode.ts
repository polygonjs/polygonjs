import {MathUtils, PerspectiveCamera} from 'three';
import {TypeAssert} from '../../../engine/poly/Assert';
import {CoreObject} from '../../geometry/Object';
import {PerspectiveCameraAttribute, UpdateProjectionOptions} from '../CoreCamera';
import {CameraFrameMode} from '../CoreCameraFrameMode';
import {BaseCoreCameraFrameMode} from './_BaseCoreCameraFrameMode';
import {cameraSetViewOffset} from '../CoreCameraViewOffset';

interface CoreCameraPerspectiveFrameModeOptions {
	camera: PerspectiveCamera;
	mode: CameraFrameMode;
	fov: number;
	expectedAspectRatio: number;
}
interface UpdateOptions extends UpdateProjectionOptions {
	cameraWithAttributes?: PerspectiveCamera;
}

export class CoreCameraPerspectiveFrameMode {
	static updateCameraAspect(camera: PerspectiveCamera, aspect: number, options?: UpdateOptions) {
		camera.aspect = aspect;
		const cameraWithAttributes = options?.cameraWithAttributes || camera;

		const frameMode = BaseCoreCameraFrameMode.frameMode(cameraWithAttributes);
		const expectedAspectRatio = BaseCoreCameraFrameMode.expectedAspectRatio(cameraWithAttributes) as
			| number
			| undefined;
		const fov = CoreObject.attribValue(cameraWithAttributes, PerspectiveCameraAttribute.FOV) as number | undefined;
		if (fov != null && expectedAspectRatio != null) {
			this._update({
				mode: frameMode,
				camera: camera,
				fov: fov,
				expectedAspectRatio: expectedAspectRatio,
			});
		}

		if (options && options.resolution) {
			cameraSetViewOffset(camera, options.resolution);
		}

		camera.updateProjectionMatrix();
	}
	private static _update(options: CoreCameraPerspectiveFrameModeOptions) {
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
	private static _adjustFOVFromModeDefault(options: CoreCameraPerspectiveFrameModeOptions) {
		options.camera.fov = options.fov;
	}
	private static _adjustFOVFromModeCover(options: CoreCameraPerspectiveFrameModeOptions) {
		// from
		// https://discourse.threejs.org/t/keeping-an-object-scaled-based-on-the-bounds-of-the-canvas-really-battling-to-explain-this-one/17574/10
		//
		if (options.camera.aspect > options.expectedAspectRatio) {
			// window too large
			const cameraHeight = Math.tan(MathUtils.degToRad(options.fov / 2));
			const ratio = options.camera.aspect / options.expectedAspectRatio;
			const newCameraHeight = cameraHeight / ratio;
			options.camera.fov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
		} else {
			options.camera.fov = options.fov;
		}
	}

	private static _adjustFOVFromModeContain(options: CoreCameraPerspectiveFrameModeOptions) {
		if (options.camera.aspect > options.expectedAspectRatio) {
			// window too large
			options.camera.fov = options.fov;
		} else {
			// window too narrow
			const cameraHeight = Math.tan(MathUtils.degToRad(options.fov / 2));
			const ratio = options.camera.aspect / options.expectedAspectRatio;
			const newCameraHeight = cameraHeight / ratio;
			options.camera.fov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
		}
	}
}
