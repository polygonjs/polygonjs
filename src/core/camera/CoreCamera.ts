import {Camera} from 'three';
import {ArrayUtils} from '../ArrayUtils';
import {CoreObject} from '../geometry/Object';

export const CORE_CAMERA_DEFAULT = {
	near: 0.1,
	far: 100.0,
};

export enum CameraAttribute {
	NODE_ID = '_Camera_nodeGeneratorId__',
	CONTROLS_PATH = '_Camera_controlsPath',
	CSS_RENDERER_PATH = '_Camera_CSSRendererPath',
	FRAME_MODE = '_Camera_frameMode',
	FRAME_MODE_EXPECTED_ASPECT_RATIO = '_Camera_frameModeExpectedAspectRatio',
	POST_PROCESS_PATH = '_Camera_postProcessPath',
	RENDER_SCENE_PATH = '_Camera_renderScenePath',
	RENDERER_PATH = '_Camera_rendererPath',
}
export const CAMERA_ATTRIBUTES: CameraAttribute[] = [
	CameraAttribute.NODE_ID,
	CameraAttribute.CONTROLS_PATH,
	CameraAttribute.CSS_RENDERER_PATH,
	CameraAttribute.FRAME_MODE,
	CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO,
	CameraAttribute.POST_PROCESS_PATH,
	CameraAttribute.RENDER_SCENE_PATH,
	CameraAttribute.RENDERER_PATH,
];
export enum PerspectiveCameraAttribute {
	FOV = '_PerspectiveCamera_fov',
}
export const PERSPECTIVE_CAMERA_ATTRIBUTES: PerspectiveCameraAttribute[] = [PerspectiveCameraAttribute.FOV];
export enum OrthographicCameraAttribute {
	SIZE = '_OrthographicCamera_size',
}
export const ORTHOGRAPHIC_CAMERA_ATTRIBUTES: OrthographicCameraAttribute[] = [OrthographicCameraAttribute.SIZE];

export function serializeCamera<C extends Camera>(camera: C, attributeNames: string[]) {
	return JSON.stringify({
		uuid: camera.uuid,
		attributes: ArrayUtils.compact(
			attributeNames.map((attribName) => {
				const value = CoreObject.attribValue(camera, attribName);
				if (value != null) {
					return {[attribName]: value};
				}
			})
		),
	});
}
